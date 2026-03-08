import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// GET /api/admin/analytics — analytics data for admin dashboard
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = request.nextUrl;
    const days = parseInt(searchParams.get("days") || "30");
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // ── Page views by day ─────────────────────────────────────
    const pageViews = await prisma.pageView.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, path: true, country: true, deviceType: true, sessionId: true, userId: true },
    });

    // Aggregate views by day
    const viewsByDay: Record<string, number> = {};
    const uniqueSessionsByDay: Record<string, Set<string>> = {};
    const topPages: Record<string, number> = {};
    const countries: Record<string, number> = {};
    const devices: Record<string, number> = {};
    const uniqueSessions = new Set<string>();

    for (const pv of pageViews) {
      // Handle createdAt as Date or string (SQLite adapter may return either)
      const dt = pv.createdAt instanceof Date ? pv.createdAt : new Date(pv.createdAt as unknown as string);
      const day = dt.toISOString().split("T")[0];
      viewsByDay[day] = (viewsByDay[day] || 0) + 1;

      if (pv.sessionId) {
        if (!uniqueSessionsByDay[day]) uniqueSessionsByDay[day] = new Set();
        uniqueSessionsByDay[day].add(pv.sessionId);
        uniqueSessions.add(pv.sessionId);
      }

      // Top pages (normalize paths)
      const cleanPath = pv.path.split("?")[0];
      topPages[cleanPath] = (topPages[cleanPath] || 0) + 1;

      // Countries
      if (pv.country) {
        countries[pv.country] = (countries[pv.country] || 0) + 1;
      }

      // Devices
      if (pv.deviceType) {
        devices[pv.deviceType] = (devices[pv.deviceType] || 0) + 1;
      }
    }

    // Sort top pages
    const topPagesArr = Object.entries(topPages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([path, views]) => ({ path, views }));

    // Sort countries
    const countriesArr = Object.entries(countries)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([country, views]) => ({ country, views }));

    // Unique visitors by day
    const visitorsByDay: Record<string, number> = {};
    for (const [day, sessions] of Object.entries(uniqueSessionsByDay)) {
      visitorsByDay[day] = sessions.size;
    }

    // ── Customer growth ───────────────────────────────────────
    const users = await prisma.user.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    });

    const customersByDay: Record<string, number> = {};
    for (const u of users) {
      const dt = u.createdAt instanceof Date ? u.createdAt : new Date(u.createdAt as unknown as string);
      const day = dt.toISOString().split("T")[0];
      customersByDay[day] = (customersByDay[day] || 0) + 1;
    }

    // Cumulative customers
    const totalCustomers = await prisma.user.count({ where: { role: "user" } });

    // ── Subscriber growth ─────────────────────────────────────
    const subscribers = await prisma.subscriber.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, language: true },
    });

    const subscribersByDay: Record<string, number> = {};
    const subscriberLanguages: Record<string, number> = {};
    for (const s of subscribers) {
      const dt = s.createdAt instanceof Date ? s.createdAt : new Date(s.createdAt as unknown as string);
      const day = dt.toISOString().split("T")[0];
      subscribersByDay[day] = (subscribersByDay[day] || 0) + 1;
      const lang = s.language || "en";
      subscriberLanguages[lang] = (subscriberLanguages[lang] || 0) + 1;
    }

    const totalSubscribers = await prisma.subscriber.count();

    // ── Today's stats ─────────────────────────────────────────
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayViews = await prisma.pageView.count({ where: { createdAt: { gte: todayStart } } });
    const todayVisitors = await prisma.pageView.findMany({
      where: { createdAt: { gte: todayStart } },
      select: { sessionId: true },
      distinct: ["sessionId"],
    });

    // ── Top Blog Posts by view count ──────────────────────────
    let topBlogPosts: { slug: string; title: string; viewCount: number }[] = [];
    try {
      topBlogPosts = await prisma.blogPost.findMany({
        where: { published: true, language: "en" },
        select: { slug: true, title: true, viewCount: true },
        orderBy: { viewCount: "desc" },
        take: 10,
      });
    } catch { /* viewCount column may not exist yet */ }

    // ── Summary ───────────────────────────────────────────────
    return NextResponse.json({
      period: { days, since: since.toISOString() },
      today: {
        pageViews: todayViews,
        uniqueVisitors: todayVisitors.length,
      },
      totals: {
        pageViews: pageViews.length,
        uniqueVisitors: uniqueSessions.size,
        totalCustomers,
        totalSubscribers,
        newCustomers: users.length,
        newSubscribers: subscribers.length,
      },
      timeSeries: {
        viewsByDay,
        visitorsByDay,
        customersByDay,
        subscribersByDay,
      },
      topPages: topPagesArr,
      countries: countriesArr,
      devices,
      subscriberLanguages,
      topBlogPosts,
    });
  } catch (e: unknown) {
    console.error("Analytics API error:", e);
    const msg = e instanceof Error ? e.message : "Error";
    const stack = e instanceof Error ? e.stack : undefined;
    return NextResponse.json(
      { error: msg, detail: process.env.NODE_ENV !== "production" ? stack : undefined },
      { status: msg === "Unauthorized" || msg === "Forbidden" ? 403 : 500 }
    );
  }
}
