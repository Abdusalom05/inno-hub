-- Rename the student role to match the new auth model
ALTER TYPE "Role" RENAME VALUE 'STUDENT' TO 'USER';

-- Update the User table for JWT + Firebase auth
ALTER TABLE "User"
  DROP COLUMN "surname",
  ALTER COLUMN "password" SET DEFAULT '',
  ALTER COLUMN "role" SET DEFAULT 'USER',
  ADD COLUMN "firebaseUid" TEXT,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE UNIQUE INDEX "User_firebaseUid_key" ON "User"("firebaseUid");
