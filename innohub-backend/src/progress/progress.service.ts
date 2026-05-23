import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CourseStatus,
  EnrollmentStatus,
  Prisma,
  TopicStatus,
  UserStatus,
} from '@prisma/client';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CompleteLessonDto } from './dto/complete-lesson.dto';
import { UpdateLessonProgressDto } from './dto/update-lesson-progress.dto';

const topicSelect = {
  id: true,
  courseId: true,
  lessonNumber: true,
  title: true,
  durationLabel: true,
  isPreview: true,
  status: true,
  course: {
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      totalLessons: true,
    },
  },
} satisfies Prisma.TopicSelect;

const progressSelect = {
  id: true,
  topicId: true,
  courseId: true,
  isCompleted: true,
  completedAt: true,
  lastViewedAt: true,
  watchSeconds: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.LessonProgressSelect;

const enrollmentSummarySelect = {
  id: true,
  status: true,
  enrolledAt: true,
  updatedAt: true,
  completedAt: true,
  completedTopicsCount: true,
  progressPercent: true,
  lastTopic: {
    select: {
      id: true,
      lessonNumber: true,
      title: true,
      durationLabel: true,
      isPreview: true,
    },
  },
} satisfies Prisma.EnrollmentSelect;

type ProgressRecord = Prisma.LessonProgressGetPayload<{
  select: typeof progressSelect;
}>;

type EnrollmentSummaryRecord = Prisma.EnrollmentGetPayload<{
  select: typeof enrollmentSummarySelect;
}>;

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async updateLessonProgress(
    user: AuthenticatedUser,
    topicId: string,
    dto: UpdateLessonProgressDto,
  ) {
    this.assertUserCanLearn(user);

    const topic = await this.getTopicOrThrow(topicId);
    this.assertCourseIsAvailable(topic.course.status);

    const result = await this.prisma.$transaction(async (tx) => {
      const enrollment = await tx.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: topic.courseId,
          },
        },
        select: { id: true },
      });

      if (!enrollment) {
        throw new ForbiddenException('You must be enrolled in this course.');
      }

      const existingProgress = await tx.lessonProgress.findUnique({
        where: {
          userId_topicId: {
            userId: user.id,
            topicId,
          },
        },
        select: {
          watchSeconds: true,
          isCompleted: true,
        },
      });

      const watchSeconds = Math.max(
        existingProgress?.watchSeconds ?? 0,
        dto.watchSeconds,
      );
      const now = new Date();

      const lessonProgress = await tx.lessonProgress.upsert({
        where: {
          userId_topicId: {
            userId: user.id,
            topicId,
          },
        },
        create: {
          userId: user.id,
          courseId: topic.courseId,
          topicId,
          watchSeconds,
          lastViewedAt: now,
          isCompleted: existingProgress?.isCompleted ?? false,
        },
        update: {
          watchSeconds,
          lastViewedAt: now,
        },
        select: progressSelect,
      });

      const enrollmentSummary = await this.recalculateEnrollment(
        tx,
        user.id,
        topicId,
        topic.courseId,
      );

      return {
        lesson: this.mapLessonProgress(lessonProgress),
        enrollment: this.mapEnrollmentSummary(
          enrollmentSummary,
          topic.course.totalLessons,
        ),
      };
    });

    return {
      topic: this.mapTopic(topic),
      ...result,
    };
  }

  async completeLesson(
    user: AuthenticatedUser,
    topicId: string,
    dto: CompleteLessonDto,
  ) {
    this.assertUserCanLearn(user);

    const topic = await this.getTopicOrThrow(topicId);
    
    if (topic.status !== TopicStatus.PUBLISHED) {
      throw new ForbiddenException('Cannot complete a draft topic.');
    }

    this.assertCourseIsAvailable(topic.course.status);

    const result = await this.prisma.$transaction(async (tx) => {
      const enrollment = await tx.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: topic.courseId,
          },
        },
        select: { id: true, status: true },
      });

      if (!enrollment || enrollment.status !== EnrollmentStatus.ACTIVE) {
        throw new ForbiddenException('You do not have an active enrollment for this course.');
      }


      const existingProgress = await tx.lessonProgress.findUnique({
        where: {
          userId_topicId: {
            userId: user.id,
            topicId,
          },
        },
        select: {
          watchSeconds: true,
        },
      });

      const watchSeconds =
        dto.watchSeconds !== undefined
          ? Math.max(existingProgress?.watchSeconds ?? 0, dto.watchSeconds)
          : (existingProgress?.watchSeconds ?? 0);
      const now = new Date();

      const lessonProgress = await tx.lessonProgress.upsert({
        where: {
          userId_topicId: {
            userId: user.id,
            topicId,
          },
        },
        create: {
          userId: user.id,
          courseId: topic.courseId,
          topicId,
          watchSeconds,
          lastViewedAt: now,
          isCompleted: true,
          completedAt: now,
        },
        update: {
          watchSeconds,
          lastViewedAt: now,
          isCompleted: true,
          completedAt: now,
        },
        select: progressSelect,
      });

      const enrollmentSummary = await this.recalculateEnrollment(
        tx,
        user.id,
        topicId,
        topic.courseId,
      );

      return {
        lesson: this.mapLessonProgress(lessonProgress),
        enrollment: this.mapEnrollmentSummary(
          enrollmentSummary,
          topic.course.totalLessons,
        ),
      };
    });

    return {
      topic: this.mapTopic(topic),
      ...result,
    };
  }

  private async getTopicOrThrow(topicId: string) {
    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId },
      select: topicSelect,
    });

    if (!topic) {
      throw new NotFoundException('Topic not found.');
    }

    return topic;
  }

  private assertUserCanLearn(user: AuthenticatedUser) {
    if (user.status === UserStatus.BLOCKED) {
      throw new ForbiddenException('Your account has been blocked.');
    }

    if (user.status === UserStatus.PENDING) {
      throw new ForbiddenException('Your account is not active yet.');
    }
  }

  private assertCourseIsAvailable(courseStatus: CourseStatus) {
    if (courseStatus !== CourseStatus.PUBLISHED) {
      throw new NotFoundException('Topic not found.');
    }
  }

  private async recalculateEnrollment(
    tx: Prisma.TransactionClient,
    userId: string,
    topicId: string,
    courseId: string,
  ): Promise<EnrollmentSummaryRecord> {
    const [totalPublishedTopics, completedPublishedTopics] = await Promise.all([
      tx.topic.count({
        where: {
          courseId,
          status: TopicStatus.PUBLISHED,
        },
      }),
      tx.lessonProgress.count({
        where: {
          userId,
          courseId,
          isCompleted: true,
          topic: {
            status: TopicStatus.PUBLISHED,
          },
        },
      }),
    ]);

    const progressPercent =
      totalPublishedTopics === 0
        ? new Prisma.Decimal(0)
        : new Prisma.Decimal(
            ((completedPublishedTopics / totalPublishedTopics) * 100).toFixed(
              2,
            ),
          );

    const isCompleted =
      totalPublishedTopics > 0 &&
      completedPublishedTopics === totalPublishedTopics;
    const enrollmentStatus = isCompleted
      ? EnrollmentStatus.COMPLETED
      : EnrollmentStatus.ACTIVE;

    return tx.enrollment.update({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      data: {
        lastTopicId: topicId,
        completedTopicsCount: completedPublishedTopics,
        progressPercent,
        status: enrollmentStatus,
        completedAt: isCompleted ? new Date() : null,
      },
      select: enrollmentSummarySelect,
    });
  }

  private mapTopic(
    topic: Awaited<ReturnType<ProgressService['getTopicOrThrow']>>,
  ) {
    return {
      id: topic.id,
      courseId: topic.courseId,
      lessonNumber: topic.lessonNumber,
      title: topic.title,
      durationLabel: topic.durationLabel,
      isPreview: topic.isPreview,
      status: topic.status,
      course: topic.course,
    };
  }

  private mapLessonProgress(progress: ProgressRecord) {
    return {
      id: progress.id,
      topicId: progress.topicId,
      courseId: progress.courseId,
      watchSeconds: progress.watchSeconds,
      isCompleted: progress.isCompleted,
      lastViewedAt: progress.lastViewedAt,
      completedAt: progress.completedAt,
      createdAt: progress.createdAt,
      updatedAt: progress.updatedAt,
    };
  }

  private mapEnrollmentSummary(
    enrollment: EnrollmentSummaryRecord,
    totalTopics: number,
  ) {
    return {
      id: enrollment.id,
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt,
      updatedAt: enrollment.updatedAt,
      completedAt: enrollment.completedAt,
      lastTopic: enrollment.lastTopic,
      progress: {
        completedTopicsCount: enrollment.completedTopicsCount,
        totalTopics,
        progressPercent: Number(enrollment.progressPercent),
      },
    };
  }
}
