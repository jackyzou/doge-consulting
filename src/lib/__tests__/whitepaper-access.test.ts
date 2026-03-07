import { describe, expect, it } from "vitest";
import {
  createWhitepaperDownloadToken,
  isValidEmail,
  normalizeEmail,
  verifyWhitepaperDownloadToken,
} from "../whitepaper-access";

describe("whitepaper-access", () => {
  it("normalizes email addresses before issuing tokens", () => {
    expect(normalizeEmail("  USER@Example.COM ")).toBe("user@example.com");
  });

  it("accepts valid email addresses and rejects invalid ones", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("not-an-email")).toBe(false);
  });

  it("creates a token that verifies to the normalized subscriber email", () => {
    const token = createWhitepaperDownloadToken("User@Example.com");
    const payload = verifyWhitepaperDownloadToken(token);

    expect(payload).toEqual({
      email: "user@example.com",
      type: "whitepaper-download",
    });
  });

  it("rejects tampered download tokens", () => {
    const token = createWhitepaperDownloadToken("user@example.com");
    const tamperedToken = `${token.slice(0, -4)}test`;

    expect(verifyWhitepaperDownloadToken(tamperedToken)).toBeNull();
  });
});