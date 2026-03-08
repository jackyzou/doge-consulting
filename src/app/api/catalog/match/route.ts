import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateSequenceNumber } from "@/lib/sequence";
import { sendQuoteRequestedEmail } from "@/lib/email-notifications";

// POST /api/catalog/match — submit a product match query (public)
// When createQuote=true, also creates a formal Quote + sends emails
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceUrl, imageData, description, sourcePrice, category, customerName, customerEmail, customerPhone, createQuote, matchId } = body;

    // If this is a quote creation request for an existing match
    if (createQuote && matchId) {
      return handleCreateQuote(matchId, customerName, customerEmail, customerPhone, body);
    }

    if (!sourceUrl && !imageData && !description) {
      return NextResponse.json({ error: "Please provide a URL, image, or description" }, { status: 400 });
    }

    // Enforce image size limit (~2MB base64 ≈ 2.7M chars)
    if (imageData && imageData.length > 3_000_000) {
      return NextResponse.json({ error: "Image too large. Please use an image under 2MB." }, { status: 400 });
    }

    // Calculate instant estimate: 20% off the source price
    let estimatedPrice: number | null = null;
    if (sourcePrice && sourcePrice > 0) {
      estimatedPrice = Math.round(sourcePrice * 0.8 * 100) / 100;
    }

    // Get user ID if logged in (optional)
    let userId: string | null = null;
    try {
      const cookieHeader = request.headers.get("cookie") || "";
      const sessionMatch = cookieHeader.match(/doge_session=([^;]+)/);
      if (sessionMatch) {
        const jwt = await import("jsonwebtoken");
        const secret = process.env.JWT_SECRET || "dev-secret-change-me";
        const payload = jwt.default.verify(sessionMatch[1], secret) as { id: string };
        userId = payload.id;
      }
    } catch { /* not logged in */ }

    const query = await prisma.productMatchQuery.create({
      data: {
        sourceUrl: sourceUrl || null,
        imageData: imageData || null,
        description: description || null,
        sourcePrice: sourcePrice ? parseFloat(sourcePrice) : null,
        estimatedPrice,
        category: category || null,
        status: "pending",
        customerName: customerName || null,
        customerEmail: customerEmail || null,
        customerPhone: customerPhone || null,
        userId,
      },
    });

    // If createQuote is set on the initial request (with contact info), create quote immediately
    if (createQuote && customerName && customerEmail) {
      return handleCreateQuote(query.id, customerName, customerEmail, customerPhone, body);
    }

    return NextResponse.json({
      id: query.id,
      estimatedPrice,
      sourcePrice: query.sourcePrice,
      message: estimatedPrice
        ? `We can source this for approximately $${estimatedPrice.toLocaleString()} \u2014 that's ${sourcePrice ? Math.round((1 - estimatedPrice / sourcePrice) * 100) : 20}% less than the US retail price.`
        : "We've received your request! Our sourcing team will analyze this product and get back to you within 24 hours with a China-direct price.",
      status: "pending",
    });
  } catch (error) {
    console.error("Product match error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}

// Create a formal Quote from a product match, send emails to customer + admin
async function handleCreateQuote(
  matchId: string,
  customerName: string,
  customerEmail: string,
  customerPhone: string | null,
  body: Record<string, unknown>,
) {
  if (!customerName || !customerEmail) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customerEmail)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  // Get the match query
  const matchQuery = await prisma.productMatchQuery.findUnique({ where: { id: matchId } });

  const sourcePrice = matchQuery?.sourcePrice ?? (body.sourcePrice ? parseFloat(String(body.sourcePrice)) : null);
  const estimatedPrice = matchQuery?.estimatedPrice ?? (sourcePrice ? Math.round(sourcePrice * 0.8 * 100) / 100 : null);
  const productDesc = matchQuery?.description || (body.description as string) || "Product from AI Matcher";
  const sourceUrl = matchQuery?.sourceUrl || (body.sourceUrl as string) || null;

  const quoteNumber = await generateSequenceNumber("QT");
  const itemName = productDesc.length > 80 ? productDesc.slice(0, 80) + "\u2026" : productDesc;

  // Create the Quote in the database (shows up in admin /admin/quotes)
  await prisma.quote.create({
    data: {
      quoteNumber,
      status: "draft",
      customerName,
      customerEmail,
      customerPhone: customerPhone || null,
      subtotal: estimatedPrice || 0,
      shippingCost: 0,
      totalAmount: estimatedPrice || 0,
      currency: "USD",
      shippingMethod: "AI Product Match",
      destinationCity: "TBD",
      notes: [
        "AI Product Match Quote",
        sourceUrl ? `Source URL: ${sourceUrl}` : null,
        sourcePrice ? `US Retail Price: $${sourcePrice}` : null,
        estimatedPrice ? `Estimated China-Direct: $${estimatedPrice}` : null,
        matchQuery?.imageData ? `(Product image attached to match query ${matchId})` : null,
      ].filter(Boolean).join("\n"),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      items: {
        create: [{
          name: itemName,
          quantity: 1,
          unitPrice: estimatedPrice || 0,
          totalPrice: estimatedPrice || 0,
          unit: "piece",
        }],
      },
    },
  });

  // Update the match query with customer info + status
  if (matchQuery) {
    await prisma.productMatchQuery.update({
      where: { id: matchId },
      data: {
        customerName,
        customerEmail,
        customerPhone: customerPhone || null,
        status: "quoted",
      },
    });
  }

  // Send emails: confirmation to customer + notification to admin (dogetech77@gmail.com)
  sendQuoteRequestedEmail({
    quoteNumber,
    customerName,
    customerEmail,
    shippingEstimateUSD: estimatedPrice || 0,
    items: [{ name: itemName, quantity: 1 }],
    deliveryType: "AI Product Match",
    destination: "TBD \u2014 Our team will confirm",
  }).catch((err: unknown) => console.error("Failed to send product match quote email:", err));

  return NextResponse.json({
    id: matchId,
    quoteNumber,
    estimatedPrice,
    sourcePrice,
    message: `Quote ${quoteNumber} created! We'll email you at ${customerEmail} with the exact China-direct price within 24 hours.`,
    status: "quoted",
  });
}
