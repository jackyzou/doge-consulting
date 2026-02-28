-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "quoteId" TEXT,
    "customerId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "subtotal" REAL NOT NULL DEFAULT 0,
    "shippingCost" REAL NOT NULL DEFAULT 0,
    "insuranceCost" REAL NOT NULL DEFAULT 0,
    "customsDuty" REAL NOT NULL DEFAULT 0,
    "discount" REAL NOT NULL DEFAULT 0,
    "taxAmount" REAL NOT NULL DEFAULT 0,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "depositAmount" REAL NOT NULL DEFAULT 0,
    "balanceDue" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "shippingMethod" TEXT,
    "originCity" TEXT NOT NULL DEFAULT 'Shenzhen',
    "destinationCity" TEXT NOT NULL DEFAULT 'Seattle, WA',
    "trackingId" TEXT,
    "vessel" TEXT,
    "estimatedDelivery" DATETIME,
    "notes" TEXT,
    "closedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("balanceDue", "closedAt", "createdAt", "currency", "customerEmail", "customerId", "customerName", "customerPhone", "customsDuty", "depositAmount", "destinationCity", "discount", "estimatedDelivery", "id", "insuranceCost", "notes", "orderNumber", "originCity", "quoteId", "shippingCost", "shippingMethod", "status", "subtotal", "taxAmount", "totalAmount", "trackingId", "updatedAt", "vessel") SELECT "balanceDue", "closedAt", "createdAt", "currency", "customerEmail", "customerId", "customerName", "customerPhone", "customsDuty", "depositAmount", "destinationCity", "discount", "estimatedDelivery", "id", "insuranceCost", "notes", "orderNumber", "originCity", "quoteId", "shippingCost", "shippingMethod", "status", "subtotal", "taxAmount", "totalAmount", "trackingId", "updatedAt", "vessel" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
CREATE UNIQUE INDEX "Order_quoteId_key" ON "Order"("quoteId");
CREATE TABLE "new_Quote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quoteNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "customerId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "customerCompany" TEXT,
    "subtotal" REAL NOT NULL DEFAULT 0,
    "shippingCost" REAL NOT NULL DEFAULT 0,
    "insuranceCost" REAL NOT NULL DEFAULT 0,
    "customsDuty" REAL NOT NULL DEFAULT 0,
    "discount" REAL NOT NULL DEFAULT 0,
    "taxAmount" REAL NOT NULL DEFAULT 0,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "depositPercent" REAL NOT NULL DEFAULT 70,
    "shippingMethod" TEXT,
    "originCity" TEXT NOT NULL DEFAULT 'Shenzhen',
    "destinationCity" TEXT NOT NULL DEFAULT 'Seattle, WA',
    "estimatedTransit" TEXT,
    "notes" TEXT,
    "validUntil" DATETIME,
    "sentAt" DATETIME,
    "acceptedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Quote_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Quote" ("acceptedAt", "createdAt", "currency", "customerCompany", "customerEmail", "customerId", "customerName", "customerPhone", "customsDuty", "depositPercent", "destinationCity", "discount", "estimatedTransit", "id", "insuranceCost", "notes", "originCity", "quoteNumber", "sentAt", "shippingCost", "shippingMethod", "status", "subtotal", "taxAmount", "totalAmount", "updatedAt", "validUntil") SELECT "acceptedAt", "createdAt", "currency", "customerCompany", "customerEmail", "customerId", "customerName", "customerPhone", "customsDuty", "depositPercent", "destinationCity", "discount", "estimatedTransit", "id", "insuranceCost", "notes", "originCity", "quoteNumber", "sentAt", "shippingCost", "shippingMethod", "status", "subtotal", "taxAmount", "totalAmount", "updatedAt", "validUntil" FROM "Quote";
DROP TABLE "Quote";
ALTER TABLE "new_Quote" RENAME TO "Quote";
CREATE UNIQUE INDEX "Quote_quoteNumber_key" ON "Quote"("quoteNumber");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "phone" TEXT,
    "company" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("company", "createdAt", "email", "id", "name", "passwordHash", "phone", "role", "updatedAt") SELECT "company", "createdAt", "email", "id", "name", "passwordHash", "phone", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
