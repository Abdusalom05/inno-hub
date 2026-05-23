import { PrismaClient, CourseLevel, CourseStatus, TopicStatus, EnrollmentStatus, Role, UserStatus, AuthProvider } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function ensureAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();

  if (!adminEmail || !adminPassword) {
    console.log('ADMIN_EMAIL or ADMIN_PASSWORD not set, skipping admin user seed.');
    return;
  }

  if (adminPassword.length < 8) {
    throw new Error('ADMIN_PASSWORD must be at least 8 characters long.');
  }

  const password = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      fullName: 'Inno HUB Admin',
      password,
      role: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      provider: AuthProvider.EMAIL,
      deletedAt: null,
    },
    create: {
      email: adminEmail,
      fullName: 'Inno HUB Admin',
      password,
      role: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      provider: AuthProvider.EMAIL,
    },
  });

  console.log(`Admin user ensured: ${adminEmail}`);
}

async function main() {
  await ensureAdminUser();
  console.log('🌱 Starting specialized course seeding...');

  // 1. Ensure user exists
  const email = 'coderznz@gmail.com';
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.log(`👤 User ${email} not found, creating...`);
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);
    user = await prisma.user.create({
      data: {
        email,
        fullName: 'Test Student',
        password,
        role: Role.USER,
        status: UserStatus.ACTIVE,
        provider: AuthProvider.EMAIL,
      },
    });
  }

  // 2. Create Course
  const courseId = 'html5-modern-web-course';
  console.log('📚 Creating/Updating course: HTML5 & Modern Web Standards');
  
  const course = await prisma.course.upsert({
    where: { id: courseId },
    update: {
      title: 'HTML5 & Modern Web Standards',
      slug: 'html5-modern-web',
      status: CourseStatus.PUBLISHED,
    },
    create: {
      id: courseId,
      title: 'HTML5 & Modern Web Standards',
      slug: 'html5-modern-web',
      description: 'Master the foundation of the web with our comprehensive HTML5 deep dive. From semantic structure to modern web APIs and accessibility.',
      level: CourseLevel.BEGINNER,
      durationLabel: '5 hours',
      status: CourseStatus.PUBLISHED,
      totalLessons: 10,
    },
  });

  const topicsData = [
    { title: 'Introduction to Web & HTML Structure', videoId: 'qz0aGYrrlhU' },
    { title: 'Text Formatting & Semantic Tags', videoId: 'kUMe1fh4034' },
    { title: 'Lists and Hyperlinks', videoId: 'CH50zuS8Zq0' },
    { title: 'Working with Images and Multimedia', videoId: 'v8Z6fWId0ms' },
    { title: 'Tables & Data Representation', videoId: '887Y6Tz07_w' },
    { title: 'Forms, Inputs, and Validations', videoId: 'fNcJuPIZ2WE' },
    { title: 'HTML5 Canvas & SVG Basics', videoId: '57C0L50m36s' },
    { title: 'SEO Meta Tags & Head Section', videoId: 'M-mH8_R0HHA' },
    { title: 'Web Accessibility (A11y)', videoId: 'cOmehxAU_4s' },
    { title: 'Final Project: Building a Static Portfolio', videoId: 'FQU20G_8Z_0' },
  ];

  console.log('📖 Generating 10 lessons...');
  for (let i = 0; i < topicsData.length; i++) {
    const topic = await prisma.topic.upsert({
      where: {
        courseId_lessonNumber: {
          courseId: courseId,
          lessonNumber: i + 1,
        },
      },
      update: {
        title: topicsData[i].title,
        videoId: topicsData[i].videoId,
      },
      create: {
        courseId: courseId,
        lessonNumber: i + 1,
        title: topicsData[i].title,
        videoId: topicsData[i].videoId,
        durationLabel: '30:00',
        status: TopicStatus.PUBLISHED,
        contentMarkdown: `## ${topicsData[i].title}\n\nIn this lesson, we explore ${topicsData[i].title.toLowerCase()} in depth.\n\n### Code Example\n\`\`\`html\n<!DOCTYPE html>\n<html>\n<body>\n  <h1>${topicsData[i].title}</h1>\n  <p>Learn more about web standards.</p>\n</body>\n</html>\n\`\`\``,
      },
    });

    if (i < 3) {
      await prisma.lessonProgress.upsert({
        where: {
          userId_topicId: {
            userId: user.id,
            topicId: topic.id,
          },
        },
        update: { isCompleted: true },
        create: {
          userId: user.id,
          courseId: courseId,
          topicId: topic.id,
          isCompleted: true,
          watchSeconds: 1100,
          completedAt: new Date(),
        },
      });
    }
  }

  console.log(`📈 Enrolling ${email} and setting progress...`);
  await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: courseId,
      },
    },
    update: {
      completedTopicsCount: 3,
      progressPercent: 30.00,
    },
    create: {
      userId: user.id,
      courseId: courseId,
      status: EnrollmentStatus.ACTIVE,
      completedTopicsCount: 3,
      progressPercent: 30.00,
    },
  });

  console.log('🚀 Specialized seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
