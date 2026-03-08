-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BlogPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '📦',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "authorName" TEXT NOT NULL DEFAULT 'Doge Consulting Team',
    "readTime" TEXT NOT NULL DEFAULT '5 min',
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_BlogPost" ("authorName", "category", "content", "createdAt", "emoji", "excerpt", "id", "language", "published", "readTime", "slug", "title", "updatedAt") SELECT "authorName", "category", "content", "createdAt", "emoji", "excerpt", "id", "language", "published", "readTime", "slug", "title", "updatedAt" FROM "BlogPost";
DROP TABLE "BlogPost";
ALTER TABLE "new_BlogPost" RENAME TO "BlogPost";
CREATE UNIQUE INDEX "BlogPost_slug_language_key" ON "BlogPost"("slug", "language");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
