import {
  ConflictException,
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
import { EnrollCourseDto } from './dto/enroll-course.dto';
import { MyCoursesQueryDto } from './dto/my-courses-query.dto';

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
    select: {
      id: true,
      fullName: true,
      avatarUrl: true,
    },
  },
} satisfies Prisma.CourseSelect;

const lastTopicSelect = {
  id: true,
  lessonNumber: true,
  title: true,
  durationLabel: true,
  isPreview: true,
} satisfies Prisma.TopicSelect;

const enrollmentSelect = {
  id: true,
  enrolledAt: true,
  updatedAt: true,
  completedAt: true,
  status: true,
  completedTopicsCount: true,
  progressPercent: true,
  course: {
    select: courseSummarySelect,
  },
  lastTopic: {
    select: lastTopicSelect,
  },
} satisfies Prisma.EnrollmentSelect;

const enrollmentDetailSelect = {
  ...enrollmentSelect,
  course: {
    select: {
      ...courseSummarySelect,
      topics: {
        where: {
          status: TopicStatus.PUBLISHED,
        },
        orderBy: {
          lessonNumber: 'asc',
        },
        select: lastTopicSelect,
      },
    },
  },
} satisfies Prisma.EnrollmentSelect;

type EnrollmentRecord = Prisma.EnrollmentGetPayload<{
  select: typeof enrollmentSelect;
}>;

type CourseDetailRecord = Prisma.EnrollmentGetPayload<{
  select: typeof enrollmentDetailSelect;
}>;

@Injectable()
export class EnrollmentService {
  constructor(private readonly prisma: PrismaService) {}

  async enroll(user: AuthenticatedUser, dto: EnrollCourseDto) {
    this.assertUserCanEnroll(user);

    const course = await this.prisma.course.findFirst({
      where: {
        id: dto.courseId,
        status: CourseStatus.PUBLISHED,
      },
      select: {
        id: true,
      },
    });

    if (!course) {
      throw new NotFoundException('Published course not found.');
    }

    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: dto.courseId,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingEnrollment) {
      throw new ConflictException('You are already enrolled in this course.');
    }

    const enrollment = await this.prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId: dto.courseId,
        status: EnrollmentStatus.ACTIVE,
      },
      select: enrollmentSelect,
    });

    return this.mapEnrollment(enrollment);
  }

  async getMyCourses(user: AuthenticatedUser, query: MyCoursesQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.EnrollmentWhereInput = {
      userId: user.id,
      status: query.status,
      course: {
        status: CourseStatus.PUBLISHED,
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
                  slug: {
                    contains: query.search,
                    mode: 'insensitive',
                  },
                },
              ],
            }
          : {}),
      },
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.enrollment.findMany({
        where,
        select: enrollmentSelect,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.enrollment.count({ where }),
    ]);

    return {
      items: items.map((item) => this.mapEnrollment(item)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async getMyCourseById(user: AuthenticatedUser, courseId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
      select: enrollmentDetailSelect,
    });

    if (!enrollment || enrollment.course.status !== CourseStatus.PUBLISHED) {
      throw new NotFoundException('Enrollment not found.');
    }

    return this.mapEnrollmentDetail(enrollment);
  }

  private assertUserCanEnroll(user: AuthenticatedUser) {
    if (user.status === UserStatus.BLOCKED) {
      throw new ForbiddenException('Your account has been blocked.');
    }

    if (user.status === UserStatus.PENDING) {
      throw new ForbiddenException('Your account is not active yet.');
    }
  }

  private mapEnrollment(enrollment: EnrollmentRecord) {
    return {
      id: enrollment.id,
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt,
      updatedAt: enrollment.updatedAt,
      completedAt: enrollment.completedAt,
      progress: {
        completedTopicsCount: enrollment.completedTopicsCount,
        totalTopics: enrollment.course.totalLessons,
        progressPercent: this.decimalToNumber(enrollment.progressPercent),
      },
      lastTopic: enrollment.lastTopic,
      course: enrollment.course,
    };
  }

  private mapEnrollmentDetail(enrollment: CourseDetailRecord) {
    const mapped = this.mapEnrollment(enrollment);

    return {
      ...mapped,
      course: {
        ...mapped.course,
        topics: enrollment.course.topics,
      },
    };
  }

  private decimalToNumber(value: Prisma.Decimal | number): number {
    return Number(value);
  }
}
