/**
 * Unit tests for the auth module.
 *
 * Tests password hashing, JWT token creation/verification,
 * and session helper functions.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies before importing the module
vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// We need to test the pure functions, so import after mocks
import {
  hashPassword,
  verifyPassword,
  createToken,
  verifyToken,
  COOKIE_OPTIONS,
  type SessionUser,
} from "../auth";

describe("auth", () => {
  // ─── Password Hashing ─────────────────────────────────────────
  describe("hashPassword / verifyPassword", () => {
    it("hashes a password and verifies it correctly", async () => {
      const password = "mySecurePassword123!";
      const hash = await hashPassword(password);

      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(20);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it("rejects wrong password", async () => {
      const hash = await hashPassword("correctPassword");
      const isValid = await verifyPassword("wrongPassword", hash);
      expect(isValid).toBe(false);
    });

    it("produces different hashes for same password (salted)", async () => {
      const password = "samePassword";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      expect(hash1).not.toBe(hash2); // different salts
    });
  });

  // ─── JWT Tokens ────────────────────────────────────────────────
  describe("createToken / verifyToken", () => {
    const testUser: SessionUser = {
      id: "user-123",
      email: "test@example.com",
      name: "Test User",
      role: "admin",
    };

    it("creates a token and verifies it successfully", () => {
      const token = createToken(testUser);
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // JWT has 3 parts

      const decoded = verifyToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded!.id).toBe(testUser.id);
      expect(decoded!.email).toBe(testUser.email);
      expect(decoded!.name).toBe(testUser.name);
      expect(decoded!.role).toBe(testUser.role);
    });

    it("returns null for invalid token", () => {
      const result = verifyToken("invalid-token-string");
      expect(result).toBeNull();
    });

    it("returns null for empty string", () => {
      const result = verifyToken("");
      expect(result).toBeNull();
    });

    it("returns null for tampered token", () => {
      const token = createToken(testUser);
      const tampered = token.slice(0, -5) + "XXXXX";
      const result = verifyToken(tampered);
      expect(result).toBeNull();
    });

    it("preserves user role in token payload", () => {
      const adminToken = createToken({ ...testUser, role: "admin" });
      const userToken = createToken({ ...testUser, role: "user" });

      const adminDecoded = verifyToken(adminToken);
      const userDecoded = verifyToken(userToken);

      expect(adminDecoded!.role).toBe("admin");
      expect(userDecoded!.role).toBe("user");
    });
  });

  // ─── Cookie Options ────────────────────────────────────────────
  describe("COOKIE_OPTIONS", () => {
    it("has httpOnly set to true for security", () => {
      expect(COOKIE_OPTIONS.httpOnly).toBe(true);
    });

    it("has sameSite set to lax", () => {
      expect(COOKIE_OPTIONS.sameSite).toBe("lax");
    });

    it("has path set to /", () => {
      expect(COOKIE_OPTIONS.path).toBe("/");
    });

    it("has 7-day maxAge", () => {
      expect(COOKIE_OPTIONS.maxAge).toBe(60 * 60 * 24 * 7);
    });
  });
});
