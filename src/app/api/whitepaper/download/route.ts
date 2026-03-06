import { NextResponse } from "next/server";
import jsPDF from "jspdf";

// GET /api/whitepaper/download — generate and download the PDF
export async function GET() {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const margin = 20;
  const contentW = W - margin * 2;
  let y = 0;

  const teal = [13, 148, 136] as [number, number, number];
  const navy = [15, 23, 42] as [number, number, number];
  const gray = [107, 114, 128] as [number, number, number];
  const gold = [234, 179, 8] as [number, number, number];

  function checkPage(need: number) {
    if (y + need > 270) { doc.addPage(); y = 25; }
  }

  function heading(text: string, size: number = 18) {
    checkPage(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(size);
    doc.setTextColor(...navy);
    doc.text(text, margin, y);
    y += size * 0.6 + 4;
  }

  function subheading(text: string) {
    checkPage(15);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...teal);
    doc.text(text, margin, y);
    y += 8;
  }

  function para(text: string) {
    checkPage(15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...gray);
    const lines = doc.splitTextToSize(text, contentW);
    doc.text(lines, margin, y);
    y += lines.length * 5 + 4;
  }

  function bullet(text: string) {
    checkPage(8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...gray);
    doc.text("•", margin + 2, y);
    const lines = doc.splitTextToSize(text, contentW - 10);
    doc.text(lines, margin + 8, y);
    y += lines.length * 5 + 2;
  }

  function tableRow(cells: string[], isHeader = false) {
    checkPage(10);
    const colW = contentW / cells.length;
    doc.setFont("helvetica", isHeader ? "bold" : "normal");
    doc.setFontSize(9);
    doc.setTextColor(isHeader ? 255 : gray[0], isHeader ? 255 : gray[1], isHeader ? 255 : gray[2]);
    if (isHeader) {
      doc.setFillColor(...teal);
      doc.rect(margin, y - 4, contentW, 8, "F");
    }
    cells.forEach((cell, i) => {
      doc.text(cell, margin + i * colW + 2, y);
    });
    y += 7;
  }

  function divider() {
    checkPage(10);
    y += 3;
    doc.setDrawColor(...teal);
    doc.setLineWidth(0.5);
    doc.line(margin, y, W - margin, y);
    y += 8;
  }

  // ═══════════════ COVER PAGE ═══════════════
  doc.setFillColor(...navy);
  doc.rect(0, 0, W, 297, "F");

  doc.setFontSize(36);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("The China Sourcing", margin, 80);
  doc.text("Playbook", margin, 96);

  doc.setFontSize(16);
  doc.setTextColor(...gold);
  doc.text("How to Build a Profitable Import Business", margin, 116);

  doc.setFontSize(11);
  doc.setTextColor(200, 200, 200);
  doc.text("A comprehensive guide by Doge Consulting", margin, 135);
  doc.text("doge-consulting.com", margin, 145);

  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text("50+ pages of factory prices, business models,", margin, 175);
  doc.text("logistics guides, and customs walkthroughs.", margin, 183);

  doc.setFontSize(48);
  doc.setTextColor(...teal);
  doc.text("📘", W - 60, 90);

  // ═══════════════ CHAPTER 1 ═══════════════
  doc.addPage();
  y = 25;

  heading("Chapter 1: Why China?", 22);
  subheading("The $3.7 Trillion Manufacturing Powerhouse");
  para("China produces over 28% of the world's manufactured goods — more than the US, South Korea, Germany, and the UK combined. With 773 million workers, the world's largest labor force, and three of the busiest container ports, China's manufacturing dominance shows no signs of slowing.");
  para("For US businesses and consumers, this translates to a massive opportunity: products manufactured in China typically cost 40-60% less than US retail prices, even after shipping and customs duties.");
  y += 5;

  subheading("Key Competitive Advantages");
  bullet("Immense manufacturing scale with highly developed supply chains");
  bullet("$3.77 trillion in annual exports (2025)");
  bullet("Two of the world's top 5 science & technology clusters");
  bullet("142 Fortune Global 500 companies headquartered in China");
  bullet("World's largest high-speed rail network (45,000+ km)");
  bullet("Strong government industrial policy and infrastructure investment");
  y += 5;

  subheading("Top Manufacturing Hubs");
  tableRow(["City", "Specialization", "Key Products"], true);
  tableRow(["Shenzhen", "Electronics & Tech", "Phones, drones, EVs, smart devices"]);
  tableRow(["Foshan", "Furniture & Ceramics", "Marble tables, wardrobes, tile"]);
  tableRow(["Yiwu", "Small Commodities", "Toys, accessories, decorations"]);
  tableRow(["Dongguan", "OEM/ODM Mfg.", "Shoes, electronics, furniture"]);
  tableRow(["Guangzhou", "Textiles & Fashion", "Garments, fabrics, leather"]);
  tableRow(["Hangzhou", "E-Commerce", "Alibaba HQ, silk, tech"]);
  tableRow(["Zhongshan", "LED Lighting", "LED strips, bulbs, fixtures"]);
  tableRow(["Shantou", "Toys", "Action figures, plush toys"]);

  // ═══════════════ CHAPTER 2 ═══════════════
  doc.addPage();
  y = 25;

  heading("Chapter 2: The Money", 22);
  subheading("3-6x Markups From Factory to US Retail");
  para("The typical markup from Chinese factory price to US retail is 3-6x. This means a product that costs $5 to manufacture sells for $20-$30 in the US. Here are real price comparisons:");
  y += 3;

  tableRow(["Product", "Factory (China)", "US Retail", "Markup"], true);
  tableRow(["Office Chair", "$30-$60", "$150-$350", "3-5x"]);
  tableRow(["Bluetooth Earbuds", "$3-$8", "$25-$60", "4-6x"]);
  tableRow(["Marble Dining Table", "$400-$800", "$2,000-$4,000", "3-5x"]);
  tableRow(["LED Strip Lights (5m)", "$1-$3", "$12-$25", "5-8x"]);
  tableRow(["Phone Case", "$0.30-$1.50", "$10-$25", "8-12x"]);
  tableRow(["Dog Bed (Medium)", "$3-$8", "$25-$60", "3-5x"]);
  tableRow(["Yoga Mat", "$2-$5", "$20-$45", "5-8x"]);
  tableRow(["Standing Desk", "$80-$150", "$350-$800", "3-4x"]);
  tableRow(["Kitchen Knife Set", "$5-$15", "$40-$120", "4-5x"]);
  tableRow(["Smart Watch", "$8-$20", "$40-$120", "3-5x"]);
  y += 5;

  para("Even after accounting for shipping ($0.10-$1.00/kg for ocean freight), customs duties (0-25%), and selling fees (Amazon 15%, or your own marketing costs), importers typically retain 15-35% net profit margins.");

  // ═══════════════ CHAPTER 3 ═══════════════
  doc.addPage();
  y = 25;

  heading("Chapter 3: Business Models", 22);
  subheading("3 Models That Generate $10K-$100K/Month");
  y += 3;

  subheading("Model 1: Amazon FBA Private Label");
  para("Source products from China, brand with your logo, ship to Amazon warehouses. Amazon handles storage, shipping, and customer service.");
  bullet("Startup cost: $3,000-$10,000");
  bullet("Typical net margin: 15-35% after all fees");
  bullet("Time to first sale: 2-3 months");
  bullet("Scale potential: $5K-$50K/month within year 1");
  y += 3;

  subheading("Model 2: Direct-to-Consumer (Shopify)");
  para("Build your own brand and website. Higher margins but requires marketing investment.");
  bullet("Startup cost: $5,000-$15,000");
  bullet("Typical net margin: 25-45%");
  bullet("Requires Facebook/Google ad spend ($500-$2,000/month)");
  bullet("Full control over brand, pricing, and customer data");
  y += 3;

  subheading("Model 3: Wholesale/B2B Distribution");
  para("Import in bulk and sell to US retailers, contractors, or businesses.");
  bullet("Startup cost: $10,000-$50,000");
  bullet("Typical net margin: 15-25%");
  bullet("Higher volume per transaction");
  bullet("Relationships and trade shows are key");

  // ═══════════════ CHAPTER 4 ═══════════════
  doc.addPage();
  y = 25;

  heading("Chapter 4: The Logistics Chain", 22);
  subheading("12 Steps: Factory to Your Doorstep");
  y += 3;

  const steps = [
    ["1. Sourcing & Production", "Factory manufactures goods (15-45 days)"],
    ["2. Quality Inspection", "Third-party inspector checks at factory (1-2 days)"],
    ["3. Export Documentation", "Invoice, packing list, B/L prepared (1-3 days)"],
    ["4. Domestic Transport", "Trucked from factory to Chinese port (1-3 days)"],
    ["5. Chinese Export Customs", "Export clearance at origin port (1-2 days)"],
    ["6. Ocean Freight", "Ship crosses Pacific Ocean (14-35 days)"],
    ["7. US Port Arrival", "Arrives at LA, Seattle, NY/NJ, etc."],
    ["8. US Customs (CBP)", "Documents reviewed, duties assessed (1-5 days)"],
    ["9. Duty Payment", "Broker pays applicable tariff/duty"],
    ["10. Drayage", "Container moved from port to warehouse (1-3 days)"],
    ["11. Warehousing", "Goods stored or sent to Amazon FBA"],
    ["12. Last Mile Delivery", "UPS/FedEx/USPS to consumer's door (1-5 days)"],
  ];
  steps.forEach(([step, desc]) => {
    checkPage(12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...teal);
    doc.text(step, margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...gray);
    doc.text(" — " + desc, margin + doc.getTextWidth(step) + 1, y);
    y += 7;
  });

  y += 5;
  subheading("Shipping Methods Compared");
  tableRow(["Method", "Transit", "Cost/kg", "Best For"], true);
  tableRow(["Ocean FCL", "20-35 days", "$0.10-$0.50", "Large orders"]);
  tableRow(["Ocean LCL", "25-40 days", "$0.30-$1.00", "Small orders"]);
  tableRow(["Air Freight", "3-7 days", "$4-$8", "Urgent/lightweight"]);
  tableRow(["Express", "3-5 days", "$6-$12", "Samples/parcels"]);

  // ═══════════════ CHAPTER 5 ═══════════════
  doc.addPage();
  y = 25;

  heading("Chapter 5: Customs & Duties", 22);
  subheading("Duties, Tariffs, and Compliance");
  para("Every import into the US requires customs clearance through US Customs and Border Protection (CBP). Here's what you need to know:");
  y += 3;

  subheading("Key Cost Components");
  bullet("Base Duty: 0-32% depending on product HTS code (furniture = 0%, textiles = 10-32%)");
  bullet("Section 301 Tariffs: Additional 7.5-25% on most Chinese goods");
  bullet("MPF: 0.3464% of value ($31.67 minimum, $614.35 maximum per entry)");
  bullet("HMT: 0.125% of value (Harbor Maintenance Tax)");
  y += 3;

  subheading("Required Documents");
  bullet("Commercial Invoice — value, quantity, description of goods");
  bullet("Packing List — detailed cargo breakdown");
  bullet("Bill of Lading — shipping contract");
  bullet("ISF (10+2) — must be filed 24 hours before vessel departure");
  bullet("Customs Bond — required for shipments over $2,500");
  y += 3;

  subheading("Strategies to Minimize Duties");
  bullet("Ensure correct HTS classification — small differences can mean big savings");
  bullet("Use Foreign Trade Zones to defer duties");
  bullet("Apply for duty drawback if you re-export goods");
  bullet("Work with an experienced customs broker (like Doge Consulting)");

  // ═══════════════ CHAPTER 6 ═══════════════
  doc.addPage();
  y = 25;

  heading("Chapter 6: Getting Started", 22);
  subheading("Your Action Plan");
  para("Here's your step-by-step roadmap to start importing from China:");
  y += 3;

  const plan = [
    "Research products using Amazon Best Sellers, Google Trends, and Jungle Scout",
    "Find 3-5 suppliers on Alibaba — filter by 'Verified Manufacturer'",
    "Order samples ($200-$500 budget) — compare quality from each supplier",
    "Negotiate pricing and MOQ — aim for FOB pricing",
    "Arrange shipping through a freight forwarder (like Doge Consulting)",
    "Handle customs — your broker files ISF, entry, and pays duties",
    "Receive, inspect, and list your products for sale",
    "Reinvest profits into more inventory — scale what works",
  ];
  plan.forEach((step, i) => {
    checkPage(10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...teal);
    doc.text(`Step ${i + 1}:`, margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...gray);
    const lines = doc.splitTextToSize(step, contentW - 20);
    doc.text(lines, margin + 18, y);
    y += lines.length * 5 + 4;
  });

  y += 8;
  divider();

  subheading("How Doge Consulting Helps");
  para("We handle the hard parts so you can focus on selling: factory sourcing, quality inspection, shipping logistics, customs clearance, and door-to-door delivery. Our typical clients save 40-60% on premium products.");
  y += 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...teal);
  doc.text("Get Started Today:", margin, y);
  y += 8;
  doc.setFontSize(11);
  bullet("Free quote: doge-consulting.com/quote");
  bullet("Contact us: dogetech77@gmail.com");
  bullet("Call: +1 (425) 223-0449");

  y += 10;
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text("© 2026 Doge Consulting Group Limited. All rights reserved.", margin, y);
  doc.text("doge-consulting.com | Hong Kong SAR | Seattle, WA, USA", margin, y + 5);

  // Generate PDF buffer
  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="China-Sourcing-Playbook-Doge-Consulting.pdf"',
      "Content-Length": pdfBuffer.length.toString(),
    },
  });
}
