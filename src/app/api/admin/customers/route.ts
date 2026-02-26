import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// GET /api/admin/customers — CRM customer list (registered users + quote leads)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    // 1. Registered users
    const userWhere: Record<string, unknown> = {};
    if (search) {
      userWhere.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { company: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const users = await prisma.user.findMany({
      where: userWhere,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        company: true,
        role: true,
        createdAt: true,
        _count: { select: { orders: true, quotes: true, payments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // 2. Quote leads — people who submitted quotes without an account
    const registeredEmails = users.map((u) => u.email);

    // Get distinct quote emails not in registered users
    const quoteLeadRows = await prisma.quote.findMany({
      where: {
        customerId: null,
        ...(registeredEmails.length > 0 ? { customerEmail: { notIn: registeredEmails } } : {}),
        ...(search ? {
          OR: [
            { customerName: { contains: search } },
            { customerEmail: { contains: search } },
            { customerCompany: { contains: search } },
            { customerPhone: { contains: search } },
          ],
        } : {}),
      },
      select: {
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        customerCompany: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Deduplicate by email, keep latest
    const seenEmails = new Set<string>();
    const uniqueLeads = quoteLeadRows.filter((q) => {
      if (seenEmails.has(q.customerEmail)) return false;
      seenEmails.add(q.customerEmail);
      return true;
    });

    // Count quotes per lead email
    const leadEmails = uniqueLeads.map((l) => l.customerEmail);
    const quoteCounts = await prisma.quote.groupBy({
      by: ["customerEmail"],
      where: { customerEmail: { in: leadEmails } },
      _count: { id: true },
    });
    const quoteCountMap = Object.fromEntries(quoteCounts.map((qc) => [qc.customerEmail, qc._count.id]));

    // Format leads to match the user shape
    const leads = uniqueLeads.map((l) => ({
      id: `lead-${l.customerEmail}`,
      name: l.customerName,
      email: l.customerEmail,
      phone: l.customerPhone,
      company: l.customerCompany,
      role: "lead",
      createdAt: l.createdAt.toISOString(),
      _count: { orders: 0, quotes: quoteCountMap[l.customerEmail] || 1, payments: 0 },
    }));

    // Merge: registered users first, then leads
    const customers = [...users, ...leads];

    return NextResponse.json({ customers });
  } catch (error) {
    if ((error as Error).message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if ((error as Error).message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
