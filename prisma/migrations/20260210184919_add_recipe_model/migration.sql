-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'other',
    "yieldAmount" TEXT NOT NULL DEFAULT '',
    "yieldUnit" TEXT NOT NULL DEFAULT 'pieces',
    "prepTime" INTEGER NOT NULL DEFAULT 0,
    "bakeTime" INTEGER NOT NULL DEFAULT 0,
    "temperature" INTEGER NOT NULL DEFAULT 350,
    "temperatureUnit" TEXT NOT NULL DEFAULT 'F',
    "ingredients" JSONB NOT NULL DEFAULT '[]',
    "instructions" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Recipe_planId_idx" ON "Recipe"("planId");

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_planId_fkey" FOREIGN KEY ("planId") REFERENCES "BusinessPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
