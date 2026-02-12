-- AlterTable
ALTER TABLE "BusinessPlan" ADD COLUMN     "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'ceo';

-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "toolCalls" JSONB;

-- CreateTable
CREATE TABLE "AgentActivity" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "toolName" TEXT,
    "input" JSONB,
    "output" JSONB,
    "model" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgentActivity_planId_idx" ON "AgentActivity"("planId");

-- AddForeignKey
ALTER TABLE "AgentActivity" ADD CONSTRAINT "AgentActivity_planId_fkey" FOREIGN KEY ("planId") REFERENCES "BusinessPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
