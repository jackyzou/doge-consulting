-- CreateTable
CREATE TABLE "AgentLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agent" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'note',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "assignedTo" TEXT,
    "relatedTo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "AgentLog_agent_idx" ON "AgentLog"("agent");

-- CreateIndex
CREATE INDEX "AgentLog_type_idx" ON "AgentLog"("type");

-- CreateIndex
CREATE INDEX "AgentLog_priority_idx" ON "AgentLog"("priority");

-- CreateIndex
CREATE INDEX "AgentLog_status_idx" ON "AgentLog"("status");

-- CreateIndex
CREATE INDEX "AgentLog_createdAt_idx" ON "AgentLog"("createdAt");
