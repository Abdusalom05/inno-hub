/*
Warnings:

- You are about to drop the column `categoryId` on the `Course` table. All the data in the column will be lost.
- You are about to drop the column `order` on the `Course` table. All the data in the column will be lost.
- You are about to drop the column `content` on the `Topic` table. All the data in the column will be lost.
- You are about to drop the column `order` on the `Topic` table. All the data in the column will be lost.
- You are about to drop the column `slug` on the `Topic` table. All the data in the column will be lost.
- You are about to drop the column `videoUrl` on the `Topic` table. All the data in the column will be lost.
- You are about to drop the column `avatar` on the `User` table. All the data in the column will be lost.
- You are about to drop the column `completedTopics` on the `User` table. All the data in the column will be lost.
- You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
- You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
- You are about to drop the `Certificate` table. If the table is not empty, all the data it contains will be lost.
- A unique constraint covering the columns `[courseId,lessonNumber]` on the table `Topic` will be added. If there are existing duplicate values, this will fail.
- Added the required column `durationLabel` to the `Course` table without a default value. This is not possible if the table is not empty.
- Added the required column `level` to the `Course` table without a default value. This is not possible if the table is not empty.
- Added the required column `updatedAt` to the `Course` table without a default value. This is not possible if the table is not empty.
- Made the column `description` on table `Course` required. This step will fail if there are existing NULL values in that column.
- Added the required column `durationLabel` to the `Topic` table without a default value. This is not possible if the table is not empty.
- Added the required column `lessonNumber` to the `Topic` table without a default value. This is not possible if the table is not empty.
- Added the required column `updatedAt` to the `Topic` table without a default value. This is not possible if the table is not empty.
- Added the required column `videoId` to the `Topic` table without a default value. This is not possible if the table is not empty.
- Added the required column `fullName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'BLOCKED', 'PENDING');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('GOOGLE', 'EMAIL');

-- CreateEnum
CREATE TYPE "CourseLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "TopicStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'PAUSED');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SUPER_ADMIN';

-- DropForeignKey
ALTER TABLE "Certificate"
DROP CONSTRAINT "Certificate_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Certificate" DROP CONSTRAINT "Certificate_userId_fkey";

-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_categoryId_fkey";

-- AlterTable
ALTER TABLE "Course"
DROP COLUMN "categoryId",
DROP COLUMN "order",
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "createdBy" TEXT,
ADD COLUMN "durationLabel" TEXT NOT NULL,
ADD COLUMN "gradientFrom" TEXT,
ADD COLUMN "gradientTo" TEXT,
ADD COLUMN "imageUrl" TEXT,
ADD COLUMN "level" "CourseLevel" NOT NULL,
ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN "totalLessons" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "description"
SET
    NOT NULL;

-- AlterTable
ALTER TABLE "Topic"
DROP COLUMN "content",
DROP COLUMN "order",
DROP COLUMN "slug",
DROP COLUMN "videoUrl",
ADD COLUMN "contentHtml" TEXT,
ADD COLUMN "contentMarkdown" TEXT,
ADD COLUMN "durationLabel" TEXT NOT NULL,
ADD COLUMN "isPreview" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "lessonNumber" INTEGER NOT NULL,
ADD COLUMN "status" "TopicStatus" NOT NULL DEFAULT 'PUBLISHED',
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN "videoId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User"
DROP COLUMN "avatar",
DROP COLUMN "completedTopics",
DROP COLUMN "name",
ADD COLUMN "avatarUrl" TEXT,
ADD COLUMN "fullName" TEXT NOT NULL,
ADD COLUMN "lastLoginAt" TIMESTAMP(3),
ADD COLUMN "provider" "AuthProvider" NOT NULL DEFAULT 'GOOGLE',
ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "updatedAt"
DROP DEFAULT;

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "Certificate";

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastTopicId" TEXT,
    "completedTopicsCount" INTEGER NOT NULL DEFAULT 0,
    "progressPercent" DECIMAL(5, 2) NOT NULL DEFAULT 0,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "lastViewedAt" TIMESTAMP(3),
    "watchSeconds" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LessonProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Enrollment_userId_idx" ON "Enrollment" ("userId");

-- CreateIndex
CREATE INDEX "Enrollment_courseId_idx" ON "Enrollment" ("courseId");

-- CreateIndex
CREATE INDEX "Enrollment_status_idx" ON "Enrollment" ("status");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_userId_courseId_key" ON "Enrollment" ("userId", "courseId");

-- CreateIndex
CREATE INDEX "LessonProgress_userId_courseId_idx" ON "LessonProgress" ("userId", "courseId");

-- CreateIndex
CREATE INDEX "LessonProgress_courseId_idx" ON "LessonProgress" ("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "LessonProgress_userId_topicId_key" ON "LessonProgress" ("userId", "topicId");

-- CreateIndex
CREATE INDEX "Course_status_idx" ON "Course" ("status");

-- CreateIndex
CREATE INDEX "Course_sortOrder_idx" ON "Course" ("sortOrder");

-- CreateIndex
CREATE INDEX "Topic_courseId_idx" ON "Topic" ("courseId");

-- CreateIndex
CREATE INDEX "Topic_status_idx" ON "Topic" ("status");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_courseId_lessonNumber_key" ON "Topic" ("courseId", "lessonNumber");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User" ("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User" ("status");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User" ("createdAt");

-- AddForeignKey
ALTER TABLE "Course"
ADD CONSTRAINT "Course_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment"
ADD CONSTRAINT "Enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment"
ADD CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment"
ADD CONSTRAINT "Enrollment_lastTopicId_fkey" FOREIGN KEY ("lastTopicId") REFERENCES "Topic" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonProgress"
ADD CONSTRAINT "LessonProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonProgress"
ADD CONSTRAINT "LessonProgress_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonProgress"
ADD CONSTRAINT "LessonProgress_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE CASCADE ON UPDATE CASCADE;