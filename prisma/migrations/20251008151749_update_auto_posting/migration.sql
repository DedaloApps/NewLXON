/*
  Warnings:

  - You are about to drop the column `postingFrequency` on the `OnboardingResponse` table. All the data in the column will be lost.
  - Added the required column `autoPosting` to the `OnboardingResponse` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OnboardingResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "niche" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "platforms" TEXT NOT NULL,
    "tone" TEXT NOT NULL,
    "autoPosting" TEXT NOT NULL,
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
INSERT INTO "new_OnboardingResponse" ("completedAt", "contentIdeas", "generationCost", "id", "initialPosts", "niche", "objective", "platforms", "profileAnalysis", "strategy", "tone", "totalTokensUsed", "userId", "weeklyCalendar") SELECT "completedAt", "contentIdeas", "generationCost", "id", "initialPosts", "niche", "objective", "platforms", "profileAnalysis", "strategy", "tone", "totalTokensUsed", "userId", "weeklyCalendar" FROM "OnboardingResponse";
DROP TABLE "OnboardingResponse";
ALTER TABLE "new_OnboardingResponse" RENAME TO "OnboardingResponse";
CREATE UNIQUE INDEX "OnboardingResponse_userId_key" ON "OnboardingResponse"("userId");
CREATE INDEX "OnboardingResponse_userId_idx" ON "OnboardingResponse"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
