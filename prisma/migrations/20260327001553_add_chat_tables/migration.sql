-- CreateTable
CREATE TABLE IF NOT EXISTS "ChatThread" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "triggerType" TEXT NOT NULL DEFAULT 'user_message',
    "participants" TEXT NOT NULL DEFAULT '',
    "relatedId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ChatMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "threadId" TEXT NOT NULL,
    "parentId" TEXT,
    "sender" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mentions" TEXT,
    "attachments" TEXT,
    "metadata" TEXT,
    "status" TEXT NOT NULL DEFAULT 'delivered',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "ChatThread" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ChatThread_status_idx" ON "ChatThread"("status");
CREATE INDEX IF NOT EXISTS "ChatThread_createdAt_idx" ON "ChatThread"("createdAt");
CREATE INDEX IF NOT EXISTS "ChatThread_triggerType_idx" ON "ChatThread"("triggerType");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ChatMessage_threadId_idx" ON "ChatMessage"("threadId");
CREATE INDEX IF NOT EXISTS "ChatMessage_sender_idx" ON "ChatMessage"("sender");
CREATE INDEX IF NOT EXISTS "ChatMessage_createdAt_idx" ON "ChatMessage"("createdAt");
CREATE INDEX IF NOT EXISTS "ChatMessage_status_idx" ON "ChatMessage"("status");
