-- CreateTable
CREATE TABLE "Vessel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "imo" TEXT,
    "mmsi" TEXT,
    "flag" TEXT,
    "carrier" TEXT,
    "vesselType" TEXT NOT NULL DEFAULT 'container',
    "callSign" TEXT,
    "lengthM" REAL,
    "widthM" REAL,
    "yearBuilt" INTEGER,
    "photoUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "containerNumber" TEXT,
    "containerType" TEXT NOT NULL DEFAULT '40HC',
    "sealNumber" TEXT,
    "vesselId" TEXT,
    "voyageNumber" TEXT,
    "billOfLading" TEXT,
    "portOfLoading" TEXT NOT NULL DEFAULT 'Shenzhen (CNSZX)',
    "portOfDischarge" TEXT NOT NULL DEFAULT 'Seattle (USSEA)',
    "placeOfReceipt" TEXT,
    "placeOfDelivery" TEXT,
    "etd" DATETIME,
    "atd" DATETIME,
    "eta" DATETIME,
    "ata" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'booked',
    "grossWeightKg" REAL,
    "volumeCbm" REAL,
    "orderId" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Shipment_vesselId_fkey" FOREIGN KEY ("vesselId") REFERENCES "Vessel" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Shipment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ShipmentEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shipmentId" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "description" TEXT,
    "timestamp" DATETIME NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ShipmentEvent_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Vessel_imo_key" ON "Vessel"("imo");

-- CreateIndex
CREATE UNIQUE INDEX "Vessel_mmsi_key" ON "Vessel"("mmsi");

-- CreateIndex
CREATE INDEX "Shipment_containerNumber_idx" ON "Shipment"("containerNumber");

-- CreateIndex
CREATE INDEX "Shipment_billOfLading_idx" ON "Shipment"("billOfLading");

-- CreateIndex
CREATE INDEX "Shipment_status_idx" ON "Shipment"("status");

-- CreateIndex
CREATE INDEX "Shipment_orderId_idx" ON "Shipment"("orderId");

-- CreateIndex
CREATE INDEX "ShipmentEvent_shipmentId_idx" ON "ShipmentEvent"("shipmentId");

-- CreateIndex
CREATE INDEX "ShipmentEvent_timestamp_idx" ON "ShipmentEvent"("timestamp");
