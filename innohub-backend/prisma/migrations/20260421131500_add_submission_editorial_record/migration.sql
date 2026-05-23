-- CreateEnum
CREATE TYPE "SubmissionAuditAction" AS ENUM ('CREATED', 'UPDATED', 'AUTHOR_ADDED', 'AUTHOR_REMOVED');

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Journal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "issn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Journal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Issue" (
    "id" TEXT NOT NULL,
    "journalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "volume" TEXT,
    "number" TEXT,
    "year" INTEGER,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "abstract" TEXT NOT NULL,
    "keywords" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "references" TEXT NOT NULL,
    "correspondingEmail" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "journalId" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Author" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "affiliation" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissionAuditLog" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "actorId" TEXT,
    "action" "SubmissionAuditAction" NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubmissionAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Country_code_key" ON "Country"("code");

-- CreateIndex
CREATE INDEX "Country_name_idx" ON "Country"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Journal_slug_key" ON "Journal"("slug");

-- CreateIndex
CREATE INDEX "Journal_name_idx" ON "Journal"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Issue_journalId_title_key" ON "Issue"("journalId", "title");

-- CreateIndex
CREATE INDEX "Issue_journalId_idx" ON "Issue"("journalId");

-- CreateIndex
CREATE INDEX "Issue_year_idx" ON "Issue"("year");

-- CreateIndex
CREATE INDEX "Submission_countryId_idx" ON "Submission"("countryId");

-- CreateIndex
CREATE INDEX "Submission_journalId_idx" ON "Submission"("journalId");

-- CreateIndex
CREATE INDEX "Submission_issueId_idx" ON "Submission"("issueId");

-- CreateIndex
CREATE INDEX "Submission_createdAt_idx" ON "Submission"("createdAt");

-- CreateIndex
CREATE INDEX "Submission_updatedAt_idx" ON "Submission"("updatedAt");

-- CreateIndex
CREATE INDEX "Author_submissionId_idx" ON "Author"("submissionId");

-- CreateIndex
CREATE INDEX "Author_email_idx" ON "Author"("email");

-- CreateIndex
CREATE INDEX "SubmissionAuditLog_submissionId_idx" ON "SubmissionAuditLog"("submissionId");

-- CreateIndex
CREATE INDEX "SubmissionAuditLog_actorId_idx" ON "SubmissionAuditLog"("actorId");

-- CreateIndex
CREATE INDEX "SubmissionAuditLog_createdAt_idx" ON "SubmissionAuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Issue"
ADD CONSTRAINT "Issue_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "Journal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission"
ADD CONSTRAINT "Submission_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission"
ADD CONSTRAINT "Submission_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "Journal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission"
ADD CONSTRAINT "Submission_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Author"
ADD CONSTRAINT "Author_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionAuditLog"
ADD CONSTRAINT "SubmissionAuditLog_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionAuditLog"
ADD CONSTRAINT "SubmissionAuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
