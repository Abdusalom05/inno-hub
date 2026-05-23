-- DropIndex
DROP INDEX "Enrollment_userId_idx";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Enrollment_userId_status_idx" ON "Enrollment"("userId", "status");

-- CreateIndex
CREATE INDEX "Submission_correspondingEmail_idx" ON "Submission"("correspondingEmail");
