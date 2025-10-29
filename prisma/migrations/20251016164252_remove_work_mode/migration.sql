/*
  Warnings:

  - You are about to drop the column `workMode` on the `OnboardingResponse` table. All the data in the column will be lost.
  - Made the column `caption` on table `Post` required. This step will fail if there are existing NULL values in that column.

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
INSERT INTO "new_OnboardingResponse" ("audience", "audienceDetails", "business", "businessDescription", "completedAt", "contentIdeas", "generationCost", "id", "initialPosts", "instagram", "instagramReport", "instagramScore", "objective", "profileAnalysis", "strategy", "totalTokensUsed", "userId", "weeklyCalendar") SELECT "audience", "audienceDetails", "business", "businessDescription", "completedAt", "contentIdeas", "generationCost", "id", "initialPosts", "instagram", "instagramReport", "instagramScore", "objective", "profileAnalysis", "strategy", "totalTokensUsed", "userId", "weeklyCalendar" FROM "OnboardingResponse";
DROP TABLE "OnboardingResponse";
ALTER TABLE "new_OnboardingResponse" RENAME TO "OnboardingResponse";
CREATE UNIQUE INDEX "OnboardingResponse_userId_key" ON "OnboardingResponse"("userId");
CREATE INDEX "OnboardingResponse_userId_idx" ON "OnboardingResponse"("userId");
CREATE TABLE "new_Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "socialAccountId" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "caption" TEXT NOT NULL,
    "hashtags" TEXT,
    "location" TEXT,
    "hook" TEXT,
    "cta" TEXT,
    "imagePrompt" TEXT,
    "imageUrl" TEXT,
    "estimatedEngagement" TEXT,
    "bestTimeToPost" TEXT,
    "isAiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "aiPrompt" TEXT,
    "mediaUrls" TEXT,
    "thumbnailUrl" TEXT,
    "platform" TEXT NOT NULL DEFAULT 'INSTAGRAM',
    "scheduledAt" DATETIME,
    "publishedAt" DATETIME,
    "platformPostId" TEXT,
    "platformData" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Post_socialAccountId_fkey" FOREIGN KEY ("socialAccountId") REFERENCES "SocialAccount" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Post" ("aiPrompt", "bestTimeToPost", "caption", "createdAt", "cta", "estimatedEngagement", "hashtags", "hook", "id", "imagePrompt", "isAiGenerated", "location", "mediaUrls", "platformData", "platformPostId", "publishedAt", "scheduledAt", "socialAccountId", "status", "thumbnailUrl", "type", "updatedAt", "userId") SELECT "aiPrompt", "bestTimeToPost", "caption", "createdAt", "cta", "estimatedEngagement", "hashtags", "hook", "id", "imagePrompt", "isAiGenerated", "location", "mediaUrls", "platformData", "platformPostId", "publishedAt", "scheduledAt", "socialAccountId", "status", "thumbnailUrl", "type", "updatedAt", "userId" FROM "Post";
DROP TABLE "Post";
ALTER TABLE "new_Post" RENAME TO "Post";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
