-- AlterTable
ALTER TABLE "AgentRunCost" ADD COLUMN     "iterations" INTEGER,
ADD COLUMN     "modelName" TEXT;

-- CreateIndex
CREATE INDEX "AgentRunCost_modelName_idx" ON "AgentRunCost"("modelName");
