import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  const courseCount = await prisma.course.count();
  const userCount = await prisma.user.count();
  const enrollmentCount = await prisma.enrollment.count();

  console.log('--- Database Status ---');
  console.log(`Courses: ${courseCount}`);
  console.log(`Users: ${userCount}`);
  console.log(`Enrollments: ${enrollmentCount}`);
  
  if (courseCount === 0) {
    console.log('⚠️ No courses found. You may need to run: npm run db:seed');
  } else {
    console.log('✅ Database is populated.');
  }

  await prisma.$disconnect();
}

checkData();
