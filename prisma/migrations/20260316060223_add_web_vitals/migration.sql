-- CreateTable
CREATE TABLE "WebVital" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "rating" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "deviceType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "WebVital_name_idx" ON "WebVital"("name");

-- CreateIndex
CREATE INDEX "WebVital_createdAt_idx" ON "WebVital"("createdAt");

-- CreateIndex
CREATE INDEX "WebVital_path_idx" ON "WebVital"("path");
