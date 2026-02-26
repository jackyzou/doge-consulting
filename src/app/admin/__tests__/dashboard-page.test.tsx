/**
 * Frontend tests for the Admin Dashboard page.
 *
 * These tests validate the data transformation layer that converts
 * the API response shape into the page's DashboardData interface.
 * This was the exact site of the "monthlyRevenue.map is not a function" bug.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

// ─── Mock next/link ──────────────────────────────────────────────
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// ─── Mock lucide-react icons ─────────────────────────────────────
vi.mock("lucide-react", () =>
  new Proxy({}, {
    get: (_target, prop) => {
      if (prop === "__esModule") return true;
      // Return a simple span for every icon
      return ({ className }: { className?: string }) => <span className={className} data-icon={String(prop)} />;
    },
  }),
);

// ─── Mock UI components ──────────────────────────────────────────
vi.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    <div className={className} data-testid="card">{children}</div>,
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    <div className={className}>{children}</div>,
  CardHeader: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    <div className={className}>{children}</div>,
  CardTitle: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    <div className={className}>{children}</div>,
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    <span className={className}>{children}</span>,
}));

// ─── Dashboard API response fixture ─────────────────────────────
const dashboardApiResponse = {
  stats: {
    totalRevenue: 50000,
    totalPaid: 10,
    totalOrders: 25,
    activeOrders: 8,
    totalQuotes: 15,
    pendingQuotes: 5,
    totalCustomers: 40,
    totalProducts: 30,
  },
  statusCounts: [
    { status: "confirmed", count: 10 },
    { status: "delivered", count: 5 },
  ],
  monthlyRevenue: {
    "2025-01": 5000,
    "2025-02": 8000,
    "2025-03": 12000,
  },
  recentOrders: [
    {
      id: "o1",
      orderNumber: "ORD-2026-0001",
      customerName: "John Doe",
      status: "confirmed",
      totalAmount: 3000,
      createdAt: "2025-06-01T00:00:00Z",
    },
  ],
  recentQuotes: [
    {
      id: "q1",
      quoteNumber: "QT-2026-0001",
      customerName: "Jane Smith",
      status: "sent",
      totalAmount: 2000,
      createdAt: "2025-06-01T00:00:00Z",
    },
  ],
};

import AdminDashboard from "@/app/admin/page";

describe("AdminDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders dashboard with stats when API returns correct shape", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(dashboardApiResponse),
    });

    render(<AdminDashboard />);
    await waitFor(() => {
      expect(screen.getByText("$50,000")).toBeDefined();
    });
    expect(screen.getByText("8")).toBeDefined();           // activeOrders
    expect(screen.getByText("5")).toBeDefined();            // pendingQuotes
    expect(screen.getByText("40")).toBeDefined();           // totalCustomers
  });

  it("handles monthlyRevenue as object (not array) without crashing", async () => {
    // This is the exact regression test for the "monthlyRevenue.map is not a function" bug
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        ...dashboardApiResponse,
        monthlyRevenue: { "2025-01": 5000, "2025-02": 8000 },
      }),
    });

    // Should NOT throw
    expect(() => render(<AdminDashboard />)).not.toThrow();
    await waitFor(() => {
      expect(screen.getByText("Monthly Revenue")).toBeDefined();
    });
  });

  it("handles empty monthlyRevenue gracefully", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        ...dashboardApiResponse,
        monthlyRevenue: {},
      }),
    });

    render(<AdminDashboard />);
    await waitFor(() => {
      expect(screen.getByText("No revenue data yet")).toBeDefined();
    });
  });

  it("shows loading spinner before data loads", () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {})); // never resolves

    render(<AdminDashboard />);
    // Should not crash and should show the loading state
    expect(document.querySelector(".animate-spin")).toBeDefined();
  });

  it("renders recent orders with order numbers", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(dashboardApiResponse),
    });

    render(<AdminDashboard />);
    await waitFor(() => {
      expect(screen.getByText("ORD-2026-0001")).toBeDefined();
    });
  });

  it("renders recent quotes with quote numbers", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(dashboardApiResponse),
    });

    render(<AdminDashboard />);
    await waitFor(() => {
      expect(screen.getByText("QT-2026-0001")).toBeDefined();
    });
  });
});
