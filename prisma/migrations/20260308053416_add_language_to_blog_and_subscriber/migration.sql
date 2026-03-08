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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_BlogPost" ("authorName", "category", "content", "createdAt", "emoji", "excerpt", "id", "published", "readTime", "slug", "title", "updatedAt") SELECT "authorName", "category", "content", "createdAt", "emoji", "excerpt", "id", "published", "readTime", "slug", "title", "updatedAt" FROM "BlogPost";
DROP TABLE "BlogPost";
ALTER TABLE "new_BlogPost" RENAME TO "BlogPost";
CREATE UNIQUE INDEX "BlogPost_slug_language_key" ON "BlogPost"("slug", "language");
CREATE TABLE "new_Subscriber" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Subscriber" ("createdAt", "email", "id") SELECT "createdAt", "email", "id" FROM "Subscriber";
DROP TABLE "Subscriber";
ALTER TABLE "new_Subscriber" RENAME TO "Subscriber";
CREATE UNIQUE INDEX "Subscriber_email_key" ON "Subscriber"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
