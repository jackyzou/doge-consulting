/**
 * E2E smoke tests for public-facing pages.
 *
 * Verifies that all public routes render without crashing
 * and contain expected content.
 */
import { test, expect } from "@playwright/test";

test.describe("Public Pages", () => {
  test("homepage loads with Doge Consulting branding", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toContainText("Doge");
  });

  test("about page loads", async ({ page }) => {
    await page.goto("/about");
    await expect(page).toHaveTitle(/Doge/i);
  });

  test("services page loads", async ({ page }) => {
    await page.goto("/services");
    await expect(page.locator("body")).toBeVisible();
  });

  test("contact page loads with form", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator("form")).toBeVisible();
  });

  test("FAQ page loads", async ({ page }) => {
    await page.goto("/faq");
    await expect(page.locator("body")).toBeVisible();
  });

  test("quote calculator page loads", async ({ page }) => {
    await page.goto("/quote");
    await expect(page.locator("body")).toBeVisible();
  });

  test("tracking page loads", async ({ page }) => {
    await page.goto("/track");
    await expect(page.locator("body")).toBeVisible();
  });

  test("login page loads with email and password fields", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });
});
