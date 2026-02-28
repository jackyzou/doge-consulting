/**
 * API tests for admin settings routes.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { mockRequireAdmin, mockPrisma } = vi.hoisted(() => {
  return {
    mockRequireAdmin: vi.fn(),
    mockPrisma: {
      setting: {
        findMany: vi.fn().mockResolvedValue([]),
        upsert: vi.fn().mockResolvedValue({ key: "admin_email", value: "test@example.com" }),
      },
    },
  };
});

vi.mock("@/lib/auth", () => ({
  requireAdmin: () => mockRequireAdmin(),
}));

vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

vi.mock("@/lib/email-notifications", () => ({
  resetTransporter: vi.fn(),
}));

import { GET, PATCH } from "@/app/api/admin/settings/route";

describe("GET /api/admin/settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAdmin.mockResolvedValue({ id: "admin-1", role: "admin" });
  });

  it("returns settings merged with defaults", async () => {
    mockPrisma.setting.findMany.mockResolvedValue([
      { key: "admin_email", value: "custom@test.com" },
    ]);

    const response = await GET();
    const data = await response.json();

    expect(data).toHaveProperty("settings");
    // DB value overrides default
    expect(data.settings.admin_email).toBe("custom@test.com");
    // Defaults still present
    expect(data.settings.smtp_host).toBe("smtp.gmail.com");
    expect(data.settings.smtp_port).toBe("587");
    expect(data.settings.notify_quote).toBe("true");
  });

  it("returns defaults when no DB settings exist", async () => {
    mockPrisma.setting.findMany.mockResolvedValue([]);
    const response = await GET();
    const data = await response.json();

    expect(data.settings.smtp_host).toBe("smtp.gmail.com");
    expect(data.settings.admin_email).toBe("dogetech77@gmail.com");
    expect(data.settings.deposit_percent).toBe("70");
  });

  it("returns 401 when not authenticated", async () => {
    mockRequireAdmin.mockRejectedValue(new Error("Unauthorized"));
    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("returns 403 when not admin", async () => {
    mockRequireAdmin.mockRejectedValue(new Error("Forbidden"));
    const response = await GET();
    expect(response.status).toBe(403);
  });
});

describe("PATCH /api/admin/settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAdmin.mockResolvedValue({ id: "admin-1", role: "admin" });
    mockPrisma.setting.findMany.mockResolvedValue([]);
  });

  it("upserts settings and returns updated values", async () => {
    const request = new NextRequest("http://localhost:3000/api/admin/settings", {
      method: "PATCH",
      body: JSON.stringify({ admin_email: "new@test.com", smtp_host: "mail.example.com" }),
    });

    mockPrisma.setting.findMany.mockResolvedValue([
      { key: "admin_email", value: "new@test.com" },
      { key: "smtp_host", value: "mail.example.com" },
    ]);

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.settings.admin_email).toBe("new@test.com");
    expect(data.settings.smtp_host).toBe("mail.example.com");

    // Should have called upsert for each setting
    expect(mockPrisma.setting.upsert).toHaveBeenCalledTimes(2);
  });

  it("returns 400 when no settings provided", async () => {
    const request = new NextRequest("http://localhost:3000/api/admin/settings", {
      method: "PATCH",
      body: JSON.stringify({}),
    });

    const response = await PATCH(request);
    expect(response.status).toBe(400);
  });

  it("returns 401 when not authenticated", async () => {
    mockRequireAdmin.mockRejectedValue(new Error("Unauthorized"));
    const request = new NextRequest("http://localhost:3000/api/admin/settings", {
      method: "PATCH",
      body: JSON.stringify({ admin_email: "test@test.com" }),
    });
    const response = await PATCH(request);
    expect(response.status).toBe(401);
  });
});
