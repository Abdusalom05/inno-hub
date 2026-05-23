import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CourseStatus, Prisma, TopicStatus } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { isAdminRole } from '../common/enums/role.enum';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { ListTopicsQueryDto } from './dto/list-topics-query.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

const topicCourseSelect = {
  id: true,
  slug: true,
  title: true,
  status: true,
  level: true,
  durationLabel: true,
  totalLessons: true,
  sortOrder: true,
} satisfies Prisma.CourseSelect;

const topicSummarySelect = {
  id: true,
  courseId: true,
  lessonNumber: true,
  title: true,
  videoId: true,
  durationLabel: true,
  contentMarkdown: true,
  contentHtml: true,
  isPreview: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  course: {
    select: topicCourseSelect,
  },
} satisfies Prisma.TopicSelect;

type TopicSummaryRecord = Prisma.TopicGetPayload<{
  select: typeof topicSummarySelect;
}>;

@Injectable()
export class TopicsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTopicDto) {
    await this.ensureCourseExists(dto.courseId);

    try {
      const topic = await this.prisma.$transaction(async (tx) => {
        const createdTopic = await tx.topic.create({
          data: {
            courseId: dto.courseId,
            lessonNumber: dto.lessonNumber,
            title: dto.title.trim(),
            videoId: dto.videoId.trim(),
            durationLabel: dto.durationLabel.trim(),
            contentMarkdown: dto.contentMarkdown?.trim() || null,
            contentHtml: dto.contentHtml?.trim() || null,
            isPreview: dto.isPreview ?? false,
            status: dto.status ?? TopicStatus.DRAFT,
          },
          select: topicSummarySelect,
        });

        await this.syncCourseTotalLessons(tx, dto.courseId);

        return createdTopic;
      });

      return this.mapTopic(topic);
    } catch (error) {
      this.handleTopicWriteError(error);
    }
  }

  async findAll(query: ListTopicsQueryDto, user?: AuthenticatedUser) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const canAccessDrafts = this.canAccessDrafts(user);
    const requestedStatus = canAccessDrafts
      ? query.status
      : TopicStatus.PUBLISHED;

    const where: Prisma.TopicWhereInput = {
      ...(requestedStatus ? { status: requestedStatus } : {}),
      ...(query.courseId ? { courseId: query.courseId } : {}),
      ...(query.isPreview !== undefined ? { isPreview: query.isPreview } : {}),
      ...(!canAccessDrafts
        ? {
            course: {
              status: CourseStatus.PUBLISHED,
            },
          }
        : {}),
      ...(query.search
        ? {
            OR: [
              {
                title: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
              {
                contentMarkdown: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.topic.findMany({
        where,
        select: topicSummarySelect,
        skip,
        take: limit,
        orderBy: [
          {
            course: {
              sortOrder: 'asc',
            },
          },
          { lessonNumber: 'asc' },
          { createdAt: 'asc' },
        ],
      }),
      this.prisma.topic.count({ where }),
    ]);

    return {
      items: items.map((item) => this.mapTopic(item)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findOne(id: string, user?: AuthenticatedUser) {
    const canAccessDrafts = this.canAccessDrafts(user);
    const topic = canAccessDrafts
      ? await this.prisma.topic.findUnique({
          where: { id },
          select: topicSummarySelect,
        })
      : await this.prisma.topic.findFirst({
          where: {
            id,
            status: TopicStatus.PUBLISHED,
            course: {
              status: CourseStatus.PUBLISHED,
            },
          },
          select: topicSummarySelect,
        });

    if (!topic) {
      throw new NotFoundException('Topic not found.');
    }

    return this.mapTopic(topic);
  }

  async update(id: string, dto: UpdateTopicDto) {
    const existingTopic = await this.ensureTopicExists(id);
    const targetCourseId = dto.courseId ?? existingTopic.courseId;

    if (dto.courseId !== undefined && dto.courseId !== existingTopic.courseId) {
      await this.ensureCourseExists(dto.courseId);
    }

    try {
      const topic = await this.prisma.$transaction(async (tx) => {
        const updatedTopic = await tx.topic.update({
          where: { id },
          data: {
            courseId: dto.courseId,
            lessonNumber: dto.lessonNumber,
            title: dto.title?.trim(),
            videoId: dto.videoId?.trim(),
            durationLabel: dto.durationLabel?.trim(),
            contentMarkdown:
              dto.contentMarkdown !== undefined
                ? dto.contentMarkdown?.trim() || null
                : undefined,
            contentHtml:
              dto.contentHtml !== undefined
                ? dto.contentHtml?.trim() || null
                : undefined,
            isPreview: dto.isPreview,
            status: dto.status,
          },
          select: topicSummarySelect,
        });

        await this.syncCourseTotalLessons(tx, targetCourseId);

        if (targetCourseId !== existingTopic.courseId) {
          await this.syncCourseTotalLessons(tx, existingTopic.courseId);
        }

        return updatedTopic;
      });

      return this.mapTopic(topic);
    } catch (error) {
      this.handleTopicWriteError(error);
    }
  }

  async remove(id: string) {
    const existingTopic = await this.ensureTopicExists(id);

    await this.prisma.$transaction(async (tx) => {
      await tx.topic.delete({
        where: { id },
      });

      await this.syncCourseTotalLessons(tx, existingTopic.courseId);
    });

    return {
      message: 'Topic deleted successfully.',
    };
  }

  private async ensureCourseExists(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    });

    if (!course) {
      throw new NotFoundException('Course not found.');
    }
  }

  private async ensureTopicExists(id: string) {
    const topic = await this.prisma.topic.findUnique({
      where: { id },
      select: {
        id: true,
        courseId: true,
      },
    });

    if (!topic) {
      throw new NotFoundException('Topic not found.');
    }

    return topic;
  }

  private async syncCourseTotalLessons(
    tx: Prisma.TransactionClient,
    courseId: string,
  ) {
    const topicsCount = await tx.topic.count({
      where: {
        courseId,
        status: TopicStatus.PUBLISHED,
      },
    });


    await tx.course.update({
      where: { id: courseId },
      data: { totalLessons: topicsCount },
    });
  }

  private handleTopicWriteError(error: unknown): never {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        'A lesson with this lessonNumber already exists in the selected course.',
      );
    }

    throw error;
  }

  private mapTopic(topic: TopicSummaryRecord) {
    return {
      id: topic.id,
      courseId: topic.courseId,
      lessonNumber: topic.lessonNumber,
      title: topic.title,
      videoId: topic.videoId,
      durationLabel: topic.durationLabel,
      contentMarkdown: topic.contentMarkdown,
      contentHtml: topic.contentHtml,
      isPreview: topic.isPreview,
      status: topic.status,
      createdAt: topic.createdAt,
      updatedAt: topic.updatedAt,
      course: topic.course,
    };
  }

  private canAccessDrafts(user?: Pick<AuthenticatedUser, 'role'>) {
    return isAdminRole(user?.role);
  }
}
