/**
 * Unit tests for the landed-cost / revenue calculator engine.
 * Pure functions with no side effects — no mocking needed.
 */
import { describe, it, expect } from "vitest";
import {
  calculateRevenue,
  SOURCE_COUNTRIES,
  DESTINATIONS,
  PRODUCT_CATEGORIES,
  COMPLIANCE_PROFILES,
  FREIGHT_MODES,
  INCOTERMS,
  type RevenueCalcInput,
} from "../landed-cost-calculator";

const baseInput: RevenueCalcInput = {
  sourceCountryId: "cn",
  destinationId: "us",
  categoryId: "electronics",
  complianceProfileId: "electronics-fcc",
  freightMode: "ocean-lcl",
  incotermCode: "FOB",
  productCostPerUnit: 10,
  quantity: 500,
  skuCount: 2,
  freightCostTotal: 1800,
  insuranceCostTotal: 120,
  originChargesTotal: 0,
  includeSection301: true,
  includeSection122: false,
  includeCustomsBond: true,
  sellingPricePerUnit: 35,
  otherCostsPerUnit: 0.5,
};

describe("landed-cost-calculator", () => {
  describe("data integrity", () => {
    it("has 13+ source countries", () => {
      expect(SOURCE_COUNTRIES.length).toBeGreaterThanOrEqual(13);
    });

    it("has 5 destinations", () => {
      expect(DESTINATIONS).toHaveLength(5);
    });

    it("has 22+ product categories", () => {
      expect(PRODUCT_CATEGORIES.length).toBeGreaterThanOrEqual(22);
    });

    it("has 9 compliance profiles", () => {
      expect(COMPLIANCE_PROFILES).toHaveLength(9);
    });

    it("has 4 freight modes", () => {
      expect(FREIGHT_MODES).toHaveLength(4);
    });

    it("has 4 incoterms", () => {
      expect(INCOTERMS).toHaveLength(4);
    });

    it("every category has duty rates for all destinations", () => {
      const destIds = DESTINATIONS.map((d) => d.id);
      for (const cat of PRODUCT_CATEGORIES) {
        for (const destId of destIds) {
          expect(typeof cat.dutyRates[destId]).toBe("number");
        }
      }
    });
  });

  describe("calculateRevenue", () => {
    it("calculates basic China→US electronics import", () => {
      const result = calculateRevenue(baseInput);

      expect(result.customsValue).toBeGreaterThan(0);
      expect(result.totalLandedCost).toBeGreaterThan(0);
      expect(result.landedCostPerUnit).toBeGreaterThan(0);
      expect(result.totalRevenue).toBe(17500); // 35 * 500
      expect(result.grossProfit).toBeLessThan(result.totalRevenue);
    });

    it("includes Section 301 for China→US", () => {
      const result = calculateRevenue(baseInput);
      const s301Line = result.lines.find((l) => l.key === "section-301");
      expect(s301Line).toBeDefined();
      expect(s301Line!.total).toBeGreaterThan(0);
      expect(s301Line!.rate).toBe(0.25);
    });

    it("excludes Section 301 for non-China source", () => {
      const result = calculateRevenue({ ...baseInput, sourceCountryId: "vn" });
      const s301Line = result.lines.find((l) => l.key === "section-301");
      expect(s301Line).toBeUndefined();
    });

    it("includes MPF within bounds for US destination", () => {
      const result = calculateRevenue(baseInput);
      const mpfLine = result.lines.find((l) => l.key === "mpf");
      expect(mpfLine).toBeDefined();
      expect(mpfLine!.total).toBeGreaterThanOrEqual(32.71);
      expect(mpfLine!.total).toBeLessThanOrEqual(634.62);
    });

    it("includes HMF for ocean freight to US", () => {
      const result = calculateRevenue(baseInput);
      const hmfLine = result.lines.find((l) => l.key === "hmf");
      expect(hmfLine).toBeDefined();
      expect(hmfLine!.total).toBeGreaterThan(0);
    });

    it("excludes HMF for air freight to US", () => {
      const result = calculateRevenue({ ...baseInput, freightMode: "air" });
      const hmfLine = result.lines.find((l) => l.key === "hmf");
      expect(hmfLine).toBeUndefined();
    });

    it("includes VAT for UK destination", () => {
      const result = calculateRevenue({ ...baseInput, destinationId: "gb" });
      const vatLine = result.lines.find((l) => l.key === "vat-gst");
      expect(vatLine).toBeDefined();
      expect(vatLine!.rate).toBe(0.20);
    });

    it("excludes VAT for US destination", () => {
      const result = calculateRevenue(baseInput);
      const vatLine = result.lines.find((l) => l.key === "vat-gst");
      expect(vatLine).toBeUndefined();
    });

    it("calculates compliance fees correctly", () => {
      const result = calculateRevenue(baseInput);
      const compLine = result.lines.find((l) => l.key === "compliance");
      expect(compLine).toBeDefined();
      // electronics-fcc: $350 flat + $65/sku * 2 = $480
      expect(compLine!.total).toBe(480);
    });

    it("calculates per-unit landed cost", () => {
      const result = calculateRevenue(baseInput);
      expect(result.landedCostPerUnit).toBeCloseTo(result.totalLandedCost / 500, 1);
    });

    it("calculates gross profit and margin", () => {
      const result = calculateRevenue(baseInput);
      expect(result.grossProfit).toBeCloseTo(result.totalRevenue - result.totalLandedCost, 0);
      expect(result.grossMarginPct).toBeGreaterThan(0);
      expect(result.grossMarginPct).toBeLessThan(100);
    });

    it("calculates ROI", () => {
      const result = calculateRevenue(baseInput);
      expect(result.roiPct).toBeGreaterThan(0);
      const expectedRoi = ((result.grossProfit / result.totalLandedCost) * 100);
      expect(result.roiPct).toBeCloseTo(expectedRoi, 0);
    });

    it("calculates savings vs retail", () => {
      const result = calculateRevenue(baseInput);
      expect(result.savingsVsRetail).toBeGreaterThan(0);
      expect(result.savingsVsRetailPct).toBeGreaterThan(0);
    });

    it("warns about unprofitable imports", () => {
      const result = calculateRevenue({ ...baseInput, sellingPricePerUnit: 5 });
      expect(result.grossProfit).toBeLessThan(0);
      expect(result.warnings.some((w) => w.includes("unprofitable"))).toBe(true);
    });

    it("adjusts for incoterm — CIF includes freight & insurance in product cost", () => {
      const fobResult = calculateRevenue(baseInput);
      const cifResult = calculateRevenue({ ...baseInput, incotermCode: "CIF" });
      // CIF: freight and insurance already paid by seller, so landed cost should be lower by those amounts
      expect(cifResult.totalLandedCost).toBeLessThan(fobResult.totalLandedCost);
    });

    it("handles zero inputs gracefully", () => {
      const result = calculateRevenue({
        ...baseInput,
        productCostPerUnit: 0,
        quantity: 0,
        freightCostTotal: 0,
        insuranceCostTotal: 0,
        sellingPricePerUnit: 0,
      });
      expect(result.totalLandedCost).toBeGreaterThanOrEqual(0);
      expect(result.totalRevenue).toBe(0);
    });

    it("includes Section 122 reciprocal tariff when enabled", () => {
      const result = calculateRevenue({ ...baseInput, includeSection122: true });
      const s122Line = result.lines.find((l) => l.key === "section-122");
      expect(s122Line).toBeDefined();
      expect(s122Line!.total).toBeGreaterThan(0);
      expect(result.warnings.some((w) => w.includes("IEEPA"))).toBe(true);
    });
  });
});
