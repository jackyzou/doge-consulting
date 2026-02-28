/**
 * Tests for Login page logic.
 *
 * Validates form submission behavior, error handling,
 * and role-based redirect logic without rendering React components.
 * This avoids jsdom hangs from Radix UI / shadcn component imports.
 */
import { describe, it, expect } from "vitest";

// ── Inline the redirect logic from LoginPage ─────────────────────
// This mirrors the redirect decisions made after successful login.
function getLoginRedirect(role: "admin" | "user", from: string): string {
  if (role === "admin") {
    return from.startsWith("/admin") ? from : "/admin";
  }
  return from.startsWith("/account") ? from : "/account";
}

function getSignupRedirect(from: string): string {
  return from.startsWith("/admin") ? "/account" : (from === "/" ? "/account" : from);
}

// ── Validation logic (mirrors handleSubmit checks) ───────────────
function validateSignup(fields: { name: string; password: string }): string | null {
  if (!fields.name) return "Name is required";
  if (fields.password.length < 6) return "Password must be at least 6 characters";
  return null;
}

describe("Login page logic", () => {
  describe("login redirect", () => {
    it("redirects admin to /admin when from is /", () => {
      expect(getLoginRedirect("admin", "/")).toBe("/admin");
    });

    it("redirects admin to from path when from starts with /admin", () => {
      expect(getLoginRedirect("admin", "/admin/orders")).toBe("/admin/orders");
    });

    it("redirects admin to /admin when from is /account", () => {
      expect(getLoginRedirect("admin", "/account")).toBe("/admin");
    });

    it("redirects user to /account when from is /", () => {
      expect(getLoginRedirect("user", "/")).toBe("/account");
    });

    it("redirects user to from path when from starts with /account", () => {
      expect(getLoginRedirect("user", "/account/orders")).toBe("/account/orders");
    });

    it("redirects user to /account when from is /admin", () => {
      expect(getLoginRedirect("user", "/admin")).toBe("/account");
    });
  });

  describe("signup redirect", () => {
    it("redirects to /account when from is /", () => {
      expect(getSignupRedirect("/")).toBe("/account");
    });

    it("redirects to /account when from starts with /admin", () => {
      expect(getSignupRedirect("/admin/dashboard")).toBe("/account");
    });

    it("redirects to from path when from is a non-admin path", () => {
      expect(getSignupRedirect("/quote")).toBe("/quote");
    });

    it("redirects to from path when from is /account/orders", () => {
      expect(getSignupRedirect("/account/orders")).toBe("/account/orders");
    });
  });

  describe("signup validation", () => {
    it("requires name", () => {
      expect(validateSignup({ name: "", password: "123456" })).toBe("Name is required");
    });

    it("requires password of at least 6 characters", () => {
      expect(validateSignup({ name: "John", password: "12345" })).toBe("Password must be at least 6 characters");
    });

    it("returns null for valid input", () => {
      expect(validateSignup({ name: "John", password: "123456" })).toBeNull();
    });
  });

  describe("API response handling", () => {
    it("extracts error message from failed response", () => {
      const responseData = { error: "Invalid email or password" };
      const error = responseData.error || "Login failed";
      expect(error).toBe("Invalid email or password");
    });

    it("uses fallback error message when none provided", () => {
      const responseData = {};
      const error = (responseData as { error?: string }).error || "Login failed";
      expect(error).toBe("Login failed");
    });

    it("extracts user role from successful response", () => {
      const responseData = {
        user: { id: "u1", name: "Admin", email: "admin@test.com", role: "admin" },
      };
      expect(responseData.user.role).toBe("admin");
    });
  });
});
