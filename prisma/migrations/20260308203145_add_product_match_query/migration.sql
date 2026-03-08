-- CreateTable
CREATE TABLE "ProductMatchQuery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceUrl" TEXT,
    "imageData" TEXT,
    "description" TEXT,
    "sourcePrice" REAL,
    "estimatedPrice" REAL,
    "category" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "adminNotes" TEXT,
    "quotedPrice" REAL,
    "customerName" TEXT,
    "customerEmail" TEXT,
    "customerPhone" TEXT,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "ProductMatchQuery_status_idx" ON "ProductMatchQuery"("status");

-- CreateIndex
CREATE INDEX "ProductMatchQuery_createdAt_idx" ON "ProductMatchQuery"("createdAt");
