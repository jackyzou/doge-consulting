/**
 * Unit tests for the shipping rate calculator.
 *
 * Tests all exported functions against the real partner rate card data.
 * These are pure functions with no side effects — no mocking needed.
 */
import { describe, it, expect } from "vitest";
import {
  calculateVolumetricWeight,
  getChargeableWeight,
  calculateDoorToDoorQuote,
  calculateWarehousePickupQuote,
  RMB_TO_USD,
  ZONES,
  WAREHOUSE_CITIES,
  DOOR_TO_DOOR_TIERS,
  WAREHOUSE_PICKUP_TIERS,
  PRODUCT_PRESETS,
  CONTAINER_INFO,
} from "../shipping-calculator";

describe("shipping-calculator", () => {
  // ─── calculateVolumetricWeight ─────────────────────────────────
  describe("calculateVolumetricWeight", () => {
    it("calculates volumetric weight correctly (standard formula)", () => {
      // 100cm × 50cm × 60cm = 300,000 / 6,000 = 50 kg
      expect(calculateVolumetricWeight(100, 50, 60)).toBe(50);
    });

    it("handles very small dimensions", () => {
      // 10cm × 10cm × 10cm = 1,000 / 6,000 ≈ 0.1667 kg
      const result = calculateVolumetricWeight(10, 10, 10);
      expect(result).toBeCloseTo(0.1667, 3);
    });

    it("handles very large dimensions", () => {
      // 300cm × 200cm × 250cm = 15,000,000 / 6,000 = 2,500 kg
      expect(calculateVolumetricWeight(300, 200, 250)).toBe(2500);
    });

    it("returns 0 for zero dimension", () => {
      expect(calculateVolumetricWeight(100, 50, 0)).toBe(0);
    });
  });

  // ─── getChargeableWeight ───────────────────────────────────────
  describe("getChargeableWeight", () => {
    it("uses actual weight when heavier than volumetric", () => {
      expect(getChargeableWeight(80, 50)).toBe(80);
    });

    it("uses volumetric weight when heavier than actual", () => {
      expect(getChargeableWeight(30, 50)).toBe(50);
    });

    it("returns equal weight when both are the same", () => {
      expect(getChargeableWeight(100, 100)).toBe(100);
    });
  });

  // ─── calculateDoorToDoorQuote ──────────────────────────────────
  describe("calculateDoorToDoorQuote", () => {
    it("calculates quote for West Coast A (100+ KG tier)", () => {
      const quote = calculateDoorToDoorQuote("west-1", 200, 150);
      expect(quote.chargeableWeightKG).toBe(200); // actual > volumetric
      expect(quote.ratePerKG_RMB).toBe(14); // west-1 at 100+ KG
      expect(quote.lastMileSurchargeRMB).toBe(500);
      expect(quote.totalRMB).toBe(200 * 14 + 500);
      expect(quote.totalUSD).toBeCloseTo(quote.totalRMB / RMB_TO_USD, 1);
      expect(quote.deliveryType).toBe("door-to-door");
      expect(quote.destinationId).toBe("west-1");
    });

    it("uses 500+ KG tier when weight is 600 KG", () => {
      const quote = calculateDoorToDoorQuote("west-1", 600, 400);
      expect(quote.chargeableWeightKG).toBe(600);
      expect(quote.ratePerKG_RMB).toBe(12); // west-1 at 500+ KG
    });

    it("uses 1000+ KG tier", () => {
      const quote = calculateDoorToDoorQuote("west-1", 1500, 1000);
      expect(quote.chargeableWeightKG).toBe(1500);
      expect(quote.ratePerKG_RMB).toBe(11); // west-1 at 1000+ KG
    });

    it("uses 3500+ KG tier", () => {
      const quote = calculateDoorToDoorQuote("west-1", 4000, 3000);
      expect(quote.chargeableWeightKG).toBe(4000);
      expect(quote.ratePerKG_RMB).toBe(9); // west-1 at 3500+ KG
    });

    it("calculates correct rate for Northeast B zone", () => {
      const quote = calculateDoorToDoorQuote("northeast-2", 200, 150);
      expect(quote.ratePerKG_RMB).toBe(19); // northeast-2 at 100+ KG
      expect(quote.lastMileSurchargeRMB).toBe(2500);
    });

    it("calculates correct rate for Midwest zone", () => {
      const quote = calculateDoorToDoorQuote("midwest", 600, 400);
      expect(quote.ratePerKG_RMB).toBe(15); // midwest at 500+ KG
      expect(quote.lastMileSurchargeRMB).toBe(2500);
    });

    it("falls back to 'other' zone for unknown zone ID", () => {
      const quote = calculateDoorToDoorQuote("unknown-zone", 200, 150);
      expect(quote.destinationLabel).toBe("Other US Regions");
      expect(quote.lastMileSurchargeRMB).toBe(2500);
    });

    it("uses volumetric weight when heavier", () => {
      const quote = calculateDoorToDoorQuote("west-1", 100, 300);
      expect(quote.chargeableWeightKG).toBe(300); // volumetric > actual
      expect(quote.actualWeightKG).toBe(100);
      expect(quote.volumetricWeightKG).toBe(300);
    });

    it("includes transit days in quote", () => {
      const quote = calculateDoorToDoorQuote("west-1", 200, 150);
      expect(quote.transitDays).toBe("25-35 days");
    });

    it("rounds RMB total to nearest integer", () => {
      const quote = calculateDoorToDoorQuote("west-1", 200, 150);
      expect(Number.isInteger(quote.totalRMB)).toBe(true);
      expect(Number.isInteger(quote.freightRMB)).toBe(true);
    });

    it("produces correct USD conversion", () => {
      const quote = calculateDoorToDoorQuote("south", 200, 150);
      const expectedUSD = Math.round((quote.totalRMB / RMB_TO_USD) * 100) / 100;
      expect(quote.totalUSD).toBe(expectedUSD);
    });
  });

  // ─── calculateWarehousePickupQuote ─────────────────────────────
  describe("calculateWarehousePickupQuote", () => {
    it("calculates LA warehouse pickup at 500+ KG tier", () => {
      const quote = calculateWarehousePickupQuote("la", 600, 400);
      expect(quote.chargeableWeightKG).toBe(600);
      expect(quote.ratePerKG_RMB).toBe(8.5); // LA at 500+ KG
      expect(quote.lastMileSurchargeRMB).toBe(0); // no surcharge for pickup
      expect(quote.deliveryType).toBe("warehouse-pickup");
    });

    it("calculates NJ/NY warehouse pickup at 100+ KG tier", () => {
      const quote = calculateWarehousePickupQuote("njny", 200, 150);
      expect(quote.ratePerKG_RMB).toBe(15); // NJNY at 100+ KG
    });

    it("calculates Chicago pickup at 1000+ KG tier", () => {
      const quote = calculateWarehousePickupQuote("chicago", 1200, 1000);
      expect(quote.ratePerKG_RMB).toBe(11); // Chicago at 1000+ KG
    });

    it("calculates Oakland pickup at 3500+ KG tier", () => {
      const quote = calculateWarehousePickupQuote("oakland", 4000, 3000);
      expect(quote.ratePerKG_RMB).toBe(6.5); // Oakland at 3500+ KG
    });

    it("calculates Houston pickup at 100+ KG tier", () => {
      const quote = calculateWarehousePickupQuote("houston", 150, 100);
      expect(quote.ratePerKG_RMB).toBe(14); // Houston at 100+ KG
    });

    it("has zero last-mile surcharge for all pickup locations", () => {
      for (const city of WAREHOUSE_CITIES) {
        const quote = calculateWarehousePickupQuote(city.id, 200, 150);
        expect(quote.lastMileSurchargeRMB).toBe(0);
      }
    });

    it("falls back to first city for unknown city ID", () => {
      const quote = calculateWarehousePickupQuote("unknown", 200, 150);
      expect(quote.destinationLabel).toBe("Los Angeles, CA");
    });
  });

  // ─── Constants / data integrity ────────────────────────────────
  describe("data integrity", () => {
    it("has correct RMB_TO_USD exchange rate", () => {
      expect(RMB_TO_USD).toBe(7.2);
    });

    it("has 8 shipping zones", () => {
      expect(ZONES).toHaveLength(8);
    });

    it("has 5 warehouse cities", () => {
      expect(WAREHOUSE_CITIES).toHaveLength(5);
    });

    it("has 4 door-to-door tiers in ascending weight order", () => {
      expect(DOOR_TO_DOOR_TIERS).toHaveLength(4);
      expect(DOOR_TO_DOOR_TIERS[0].minKG).toBe(100);
      expect(DOOR_TO_DOOR_TIERS[1].minKG).toBe(500);
      expect(DOOR_TO_DOOR_TIERS[2].minKG).toBe(1000);
      expect(DOOR_TO_DOOR_TIERS[3].minKG).toBe(3500);
    });

    it("has 4 warehouse pickup tiers", () => {
      expect(WAREHOUSE_PICKUP_TIERS).toHaveLength(4);
    });

    it("has product presets with valid data", () => {
      expect(PRODUCT_PRESETS.length).toBeGreaterThan(0);
      for (const preset of PRODUCT_PRESETS) {
        expect(preset.name).toBeTruthy();
        expect(preset.cbm).toBeGreaterThan(0);
        expect(preset.weightKG).toBeGreaterThan(0);
        expect(preset.icon).toBeTruthy();
      }
    });

    it("has container info with valid data", () => {
      expect(CONTAINER_INFO).toHaveLength(3);
      for (const container of CONTAINER_INFO) {
        expect(container.cbm).toBeGreaterThan(0);
        expect(container.maxKG).toBeGreaterThan(0);
        expect(container.priceRange).toBeTruthy();
      }
    });

    it("each zone has all required fields", () => {
      for (const zone of ZONES) {
        expect(zone.id).toBeTruthy();
        expect(zone.label).toBeTruthy();
        expect(zone.labelZh).toBeTruthy();
        expect(zone.transitDays).toBeTruthy();
        expect(typeof zone.lastMileSurchargeRMB).toBe("number");
      }
    });

    it("each warehouse city has bilingual labels", () => {
      for (const city of WAREHOUSE_CITIES) {
        expect(city.id).toBeTruthy();
        expect(city.label).toBeTruthy();
        expect(city.labelZh).toBeTruthy();
      }
    });
  });
});
