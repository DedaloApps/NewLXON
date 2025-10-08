/*
  Warnings:

  - You are about to drop the column `autoPosting` on the `OnboardingResponse` table. All the data in the column will be lost.
  - You are about to drop the column `niche` on the `OnboardingResponse` table. All the data in the column will be lost.
  - You are about to drop the column `platforms` on the `OnboardingResponse` table. All the data in the column will be lost.
  - You are about to drop the column `tone` on the `OnboardingResponse` table. All the data in the column will be lost.
  - Added the required column `audience` to the `OnboardingResponse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `audienceDetails` to the `OnboardingResponse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `business` to the `OnboardingResponse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessDescription` to the `OnboardingResponse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workMode` to the `OnboardingResponse` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OnboardingResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "business" TEXT NOT NULL,
    "businessDescription" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "audienceDetails" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "instagram" TEXT,
    "workMode" TEXT NOT NULL,
    "instagramReport" TEXT,
    "instagramScore" REAL DEFAULT 0,
    "strategy" TEXT NOT NULL,
    "initialPosts" TEXT NOT NULL,
    "contentIdeas" TEXT NOT NULL,
    "profileAnalysis" TEXT NOT NULL,
    "weeklyCalendar" TEXT NOT NULL,
    "totalTokensUsed" INTEGER NOT NULL DEFAULT 0,
    "generationCost" REAL NOT NULL DEFAULT 0,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OnboardingResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_OnboardingResponse" ("completedAt", "contentIdeas", "generationCost", "id", "initialPosts", "objective", "profileAnalysis", "strategy", "totalTokensUsed", "userId", "weeklyCalendar") SELECT "completedAt", "contentIdeas", "generationCost", "id", "initialPosts", "objective", "profileAnalysis", "strategy", "totalTokensUsed", "userId", "weeklyCalendar" FROM "OnboardingResponse";
DROP TABLE "OnboardingResponse";
ALTER TABLE "new_OnboardingResponse" RENAME TO "OnboardingResponse";
CREATE UNIQUE INDEX "OnboardingResponse_userId_key" ON "OnboardingResponse"("userId");
CREATE INDEX "OnboardingResponse_userId_idx" ON "OnboardingResponse"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
