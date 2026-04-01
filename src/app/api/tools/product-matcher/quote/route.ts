import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateSequenceNumber } from "@/lib/sequence";
import { sendQuoteRequestedEmail } from "@/lib/email-notifications";

// POST /api/tools/product-matcher/quote — create a quote from a product match result
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      searchId,
      productName,
      productUrl,
      productPrice,
      dogePrice,
      customerName,
      customerEmail,
      customerPhone,
    } = body;

    if (!customerName || !customerEmail) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 },
      );
    }

    const quoteNumber = await generateSequenceNumber("QT");
    const itemName = (productName || "Product from AI Matcher").slice(0, 120);
    const estimatedPrice = dogePrice ? parseFloat(dogePrice) : 0;

    // Create the formal Quote
    const quote = await prisma.quote.create({
      data: {
        quoteNumber,
        status: "draft",
        customerName,
        customerEmail,
        customerPhone: customerPhone || null,
        subtotal: estimatedPrice,
        shippingCost: 0,
        totalAmount: estimatedPrice,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        notes: [
          "AI Product Matcher Quote",
          productUrl ? `Source: ${productUrl}` : null,
          productPrice ? `1688 Price: $${productPrice}` : null,
          `Estimated Doge Price: $${estimatedPrice}`,
        ]
          .filter(Boolean)
          .join("\n"),
        items: {
          create: [
            {
              name: itemName,
              description: itemName,
              quantity: 1,
              unitPrice: estimatedPrice,
              totalPrice: estimatedPrice,
            },
          ],
        },
      },
    });

    // Update the search query status if we have a searchId
    if (searchId) {
      await prisma.productMatchQuery.update({
        where: { id: searchId },
        data: {
          status: "quoted",
          customerName,
          customerEmail,
          customerPhone: customerPhone || null,
          quotedPrice: estimatedPrice,
        },
      }).catch(() => {
        // Search query may not exist — non-critical
      });
    }

    // Send notification emails
    try {
      await sendQuoteRequestedEmail({
        quoteNumber,
        customerName,
        customerEmail,
        shippingEstimateUSD: 0,
        items: [{ name: itemName, quantity: 1 }],
        deliveryType: "Sea Freight",
        destination: "USA",

      });
    } catch (emailError) {
      console.error("Failed to send quote email:", emailError);
      // Non-blocking — quote is still created
    }

    return NextResponse.json({
      quoteNumber,
      estimatedPrice,
      message: `Quote ${quoteNumber} created! We'll email you at ${customerEmail} with the exact China-direct price within 24 hours.`,
    });
  } catch (error) {
    console.error("Product matcher quote error:", error);
    return NextResponse.json(
      { error: "Failed to create quote. Please try again." },
      { status: 500 },
    );
  }
}
