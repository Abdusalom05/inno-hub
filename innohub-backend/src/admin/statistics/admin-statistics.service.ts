import { Injectable } from '@nestjs/common';
import { CourseStatus, EnrollmentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { DashboardSummaryDto } from './dto/dashboard-summary.dto';

const recentUserSelect = {
  id: true,
  email: true,
  fullName: true,
  avatarUrl: true,
  role: true,
  status: true,
  provider: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

const recentEnrollmentSelect = {
  id: true,
  enrolledAt: true,
  updatedAt: true,
  completedAt: true,
  status: true,
  progressPercent: true,
  completedTopicsCount: true,
  user: {
    select: {
      id: true,
      email: true,
      fullName: true,
      avatarUrl: true,
      role: true,
      status: true,
      provider: true,
    },
  },
  course: {
    select: {
      id: true,
      slug: true,
      title: true,
      imageUrl: true,
      level: true,
      status: true,
    },
  },
} satisfies Prisma.EnrollmentSelect;

@Injectable()
export class AdminStatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(): Promise<DashboardSummaryDto> {
    const [
      totalUsers,
      totalCourses,
      publishedCoursesCount,
      draftCoursesCount,
      totalTopics,
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
    ] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.course.count(),
      this.prisma.course.count({
        where: { status: CourseStatus.PUBLISHED },
      }),
      this.prisma.course.count({
        where: { status: CourseStatus.DRAFT },
      }),
      this.prisma.topic.count(),
      this.prisma.enrollment.count(),
      this.prisma.enrollment.count({
        where: { status: EnrollmentStatus.ACTIVE },
      }),
      this.prisma.enrollment.count({
        where: { status: EnrollmentStatus.COMPLETED },
      }),
    ]);

    return {
      totalUsers,
      totalCourses,
      totalTopics,
      totalEnrollments,
      publishedCoursesCount,
      draftCoursesCount,
      activeEnrollments,
      completedEnrollments,
    };
  }

  async getRecentUsers(limit?: string) {
    const take = this.normalizeLimit(limit);

    return this.prisma.user.findMany({
      take,
      orderBy: { createdAt: 'desc' },
      select: recentUserSelect,
    });
  }

  async getRecentEnrollments(limit?: string) {
    const take = this.normalizeLimit(limit);

    const enrollments = await this.prisma.enrollment.findMany({
      take,
      orderBy: { enrolledAt: 'desc' },
      select: recentEnrollmentSelect,
    });

    return enrollments.map((enrollment) => ({
      id: enrollment.id,
      enrolledAt: enrollment.enrolledAt,
      updatedAt: enrollment.updatedAt,
      completedAt: enrollment.completedAt,
      status: enrollment.status,
      progressPercent: Number(enrollment.progressPercent),
      completedTopicsCount: enrollment.completedTopicsCount,
      user: enrollment.user,
      course: enrollment.course,
    }));
  }

  private normalizeLimit(limit?: string): number {
    const parsed = Number(limit);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      return 10;
    }

    return Math.min(Math.trunc(parsed), 50);
  }
}
