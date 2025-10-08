-- CreateTable
CREATE TABLE "OnboardingResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "niche" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "platforms" TEXT NOT NULL,
    "tone" TEXT NOT NULL,
    "postingFrequency" INTEGER NOT NULL,
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

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingResponse_userId_key" ON "OnboardingResponse"("userId");
