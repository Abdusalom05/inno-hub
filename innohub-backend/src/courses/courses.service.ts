import { Injectable, NotFoundException } from '@nestjs/common';
import { CourseLevel, CourseStatus, Prisma, TopicStatus } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { isAdminRole } from '../common/enums/role.enum';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { ListCoursesQueryDto } from './dto/list-courses-query.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

const courseCreatorSelect = {
  id: true,
  fullName: true,
  avatarUrl: true,
} satisfies Prisma.UserSelect;

const topicSummarySelect = {
  id: true,
  lessonNumber: true,
  title: true,
  durationLabel: true,
  isPreview: true,
  status: true,
} satisfies Prisma.TopicSelect;

const courseSummarySelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  icon: true,
  imageUrl: true,
  gradientFrom: true,
  gradientTo: true,
  level: true,
  durationLabel: true,
  totalLessons: true,
  status: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
  creator: {
    select: courseCreatorSelect,
  },
  _count: {
    select: {
      topics: {
        where: {
          status: TopicStatus.PUBLISHED,
        },
      },
      enrollments: true,
    },
  },
} satisfies Prisma.CourseSelect;

const courseDetailSelect = {
  ...courseSummarySelect,
  topics: {
    where: {
      status: TopicStatus.PUBLISHED,
    },
    orderBy: {
      lessonNumber: 'asc',
    },
    select: topicSummarySelect,
  },
} satisfies Prisma.CourseSelect;

const courseAdminDetailSelect = {
  ...courseSummarySelect,
  topics: {
    orderBy: {
      lessonNumber: 'asc',
    },
    select: topicSummarySelect,
  },
} satisfies Prisma.CourseSelect;

type CourseSummaryRecord = Prisma.CourseGetPayload<{
  select: typeof courseSummarySelect;
}>;

type CourseDetailRecord = Prisma.CourseGetPayload<{
  select: typeof courseDetailSelect;
}>;

type CourseAdminDetailRecord = Prisma.CourseGetPayload<{
  select: typeof courseAdminDetailSelect;
}>;

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: AuthenticatedUser, dto: CreateCourseDto) {
    const slug = await this.generateUniqueSlug(dto.slug ?? dto.title);

    const course = await this.prisma.course.create({
      data: {
        id: randomUUID(),
        slug,
        title: dto.title.trim(),
        description: dto.description.trim(),
        icon: dto.icon?.trim() || null,
        imageUrl: dto.imageUrl?.trim() || null,
        gradientFrom: dto.gradientFrom?.trim() || null,
        gradientTo: dto.gradientTo?.trim() || null,
        level: dto.level ?? CourseLevel.BEGINNER,
        durationLabel: dto.durationLabel.trim(),
        totalLessons: dto.totalLessons ?? 0,
        status: dto.status ?? CourseStatus.DRAFT,
        sortOrder: dto.sortOrder ?? 0,
        createdBy: dto.createdBy ?? user.id,
      },
      select: courseSummarySelect,
    });

    return this.mapCourseSummary(course);
  }

  async findAll(query: ListCoursesQueryDto, user?: AuthenticatedUser) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const canAccessDrafts = this.canAccessDrafts(user);
    const requestedStatus = canAccessDrafts
      ? query.status
      : CourseStatus.PUBLISHED;

    const where: Prisma.CourseWhereInput = {
      ...(requestedStatus ? { status: requestedStatus } : {}),
      ...(query.level ? { level: query.level } : {}),
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
                description: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
              {
                slug: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.course.findMany({
        where,
        include: {
          creator: {
            select: courseCreatorSelect,
          },
          _count: {
            select: {
              topics: { where: { status: TopicStatus.PUBLISHED } },
              enrollments: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.course.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        ...item,
        publishedTopicsCount: item._count.topics,
        enrollmentsCount: item._count.enrollments,
      })),
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
    const course = await this.prisma.course.findFirst({
      where: {
        id,
        ...(canAccessDrafts ? {} : { status: CourseStatus.PUBLISHED }),
      },
      include: {
        creator: { select: courseCreatorSelect },
        topics: {
          where: canAccessDrafts ? {} : { status: TopicStatus.PUBLISHED },
          orderBy: { lessonNumber: 'asc' },
          select: topicSummarySelect,
        },
        _count: {
          select: {
            topics: { where: { status: TopicStatus.PUBLISHED } },
            enrollments: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found.');
    }

    return this.mapCourseDetail(course);
  }

  async update(id: string, dto: UpdateCourseDto) {
    await this.ensureCourseExists(id);

    const data: Prisma.CourseUpdateInput = {};

    if (dto.slug !== undefined || dto.title !== undefined) {
      const slugSource = dto.slug ?? dto.title;
      if (slugSource) {
        data.slug = await this.generateUniqueSlug(slugSource, id);
      }
    }

    if (dto.title !== undefined) {
      data.title = dto.title.trim();
    }
    if (dto.description !== undefined) {
      data.description = dto.description.trim();
    }
    if (dto.icon !== undefined) {
      data.icon = dto.icon?.trim() || null;
    }
    if (dto.imageUrl !== undefined) {
      data.imageUrl = dto.imageUrl?.trim() || null;
    }
    if (dto.gradientFrom !== undefined) {
      data.gradientFrom = dto.gradientFrom?.trim() || null;
    }
    if (dto.gradientTo !== undefined) {
      data.gradientTo = dto.gradientTo?.trim() || null;
    }
    if (dto.level !== undefined) {
      data.level = dto.level;
    }
    if (dto.durationLabel !== undefined) {
      data.durationLabel = dto.durationLabel.trim();
    }
    if (dto.totalLessons !== undefined) {
      data.totalLessons = dto.totalLessons;
    }
    if (dto.status !== undefined) {
      data.status = dto.status;
    }
    if (dto.sortOrder !== undefined) {
      data.sortOrder = dto.sortOrder;
    }
    if (dto.createdBy !== undefined) {
      data.creator = dto.createdBy
        ? { connect: { id: dto.createdBy } }
        : { disconnect: true };
    }

    const course = await this.prisma.course.update({
      where: { id },
      data,
      select: courseSummarySelect,
    });

    return this.mapCourseSummary(course);
  }

  async remove(id: string) {
    await this.ensureCourseExists(id);
    await this.prisma.course.delete({ where: { id } });

    return {
      message: 'Course deleted successfully.',
    };
  }

  private async ensureCourseExists(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!course) {
      throw new NotFoundException('Course not found.');
    }
  }

  private async generateUniqueSlug(input: string, excludeId?: string) {
    const baseSlug = this.slugify(input);
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existingCourse = await this.prisma.course.findFirst({
        where: {
          slug,
          ...(excludeId
            ? {
                NOT: {
                  id: excludeId,
                },
              }
            : {}),
        },
        select: {
          id: true,
        },
      });

      if (!existingCourse) {
        return slug;
      }

      counter += 1;
      slug = `${baseSlug}-${counter}`;
    }
  }

  private slugify(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-');
  }

  private mapCourseSummary(course: CourseSummaryRecord) {
    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      description: course.description,
      icon: course.icon,
      imageUrl: course.imageUrl,
      gradientFrom: course.gradientFrom,
      gradientTo: course.gradientTo,
      level: course.level,
      durationLabel: course.durationLabel,
      totalLessons: course.totalLessons,
      publishedTopicsCount: course._count.topics,
      enrollmentsCount: course._count.enrollments,
      status: course.status,
      sortOrder: course.sortOrder,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      creator: course.creator,
    };
  }

  private mapCourseDetail(
    course: CourseDetailRecord | CourseAdminDetailRecord,
  ) {
    return {
      ...this.mapCourseSummary(course),
      topics: course.topics,
    };
  }

  private canAccessDrafts(user?: Pick<AuthenticatedUser, 'role'>) {
    return isAdminRole(user?.role);
  }
}
