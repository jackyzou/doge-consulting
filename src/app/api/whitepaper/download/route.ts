import { NextRequest, NextResponse } from "next/server";
import jsPDF from "jspdf";
import { prisma } from "@/lib/db";
import { verifyWhitepaperDownloadToken } from "@/lib/whitepaper-access";

// GET /api/whitepaper/download — Generate comprehensive 50-70 page PDF
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "A valid whitepaper download link is required." }, { status: 401 });
  }

  const accessPayload = verifyWhitepaperDownloadToken(token);
  if (!accessPayload) {
    return NextResponse.json({ error: "This whitepaper link is invalid or expired." }, { status: 401 });
  }

  const subscriber = await prisma.subscriber.findUnique({ where: { email: accessPayload.email } });
  if (!subscriber) {
    return NextResponse.json({ error: "This whitepaper link only works for subscribed email addresses." }, { status: 403 });
  }

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210, H = 297;
  const m = 20; // margin
  const cW = W - m * 2; // content width
  let y = 0;

  // Colors
  const TEAL: [number, number, number] = [13, 148, 136];
  const NAVY: [number, number, number] = [15, 23, 42];
  const GRAY: [number, number, number] = [107, 114, 128];
  const GOLD: [number, number, number] = [234, 179, 8];
  const WHITE: [number, number, number] = [255, 255, 255];
  const LTGRAY: [number, number, number] = [243, 244, 246];
  const RED: [number, number, number] = [220, 38, 38];

  // ── Helper Functions ──
  function newPage() { doc.addPage(); y = 30; }
  function checkPage(need: number) { if (y + need > H - 25) newPage(); }

  function setColor(c: [number, number, number]) { doc.setTextColor(...c); }
  function setFill(c: [number, number, number]) { doc.setFillColor(...c); }

  function h1(text: string) {
    checkPage(25);
    doc.setFont("helvetica", "bold"); doc.setFontSize(24); setColor(NAVY);
    const lines = doc.splitTextToSize(text, cW);
    doc.text(lines, m, y); y += lines.length * 10 + 6;
  }

  function h2(text: string) {
    checkPage(18);
    doc.setFont("helvetica", "bold"); doc.setFontSize(16); setColor(TEAL);
    doc.text(text, m, y); y += 9;
  }

  function h3(text: string) {
    checkPage(14);
    doc.setFont("helvetica", "bold"); doc.setFontSize(12); setColor(NAVY);
    doc.text(text, m, y); y += 7;
  }

  function p(text: string) {
    checkPage(12);
    doc.setFont("helvetica", "normal"); doc.setFontSize(10); setColor(GRAY);
    const lines = doc.splitTextToSize(text, cW);
    doc.text(lines, m, y); y += lines.length * 4.8 + 3;
  }

  function pb(text: string) {
    checkPage(12);
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); setColor(NAVY);
    const lines = doc.splitTextToSize(text, cW);
    doc.text(lines, m, y); y += lines.length * 4.8 + 3;
  }

  function bullet(text: string, indent = 0) {
    checkPage(10);
    doc.setFont("helvetica", "normal"); doc.setFontSize(10); setColor(GRAY);
    doc.text("\u2022", m + 2 + indent, y);
    const lines = doc.splitTextToSize(text, cW - 10 - indent);
    doc.text(lines, m + 8 + indent, y); y += lines.length * 4.8 + 2;
  }

  function stat(value: string, label: string, x: number, w: number) {
    doc.setFont("helvetica", "bold"); doc.setFontSize(22); setColor(TEAL);
    doc.text(value, x + w / 2, y, { align: "center" });
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); setColor(GRAY);
    doc.text(label, x + w / 2, y + 8, { align: "center" });
  }

  function tableRow(cells: string[], widths: number[], header = false) {
    checkPage(10);
    let x = m;
    if (header) { setFill(TEAL); doc.rect(m, y - 4.5, cW, 7, "F"); }
    cells.forEach((cell, i) => {
      doc.setFont("helvetica", header ? "bold" : "normal");
      doc.setFontSize(8);
      setColor(header ? WHITE : GRAY);
      doc.text(cell, x + 2, y, { maxWidth: widths[i] - 4 });
      x += widths[i];
    });
    y += 6;
  }

  function divider() { checkPage(8); setFill(LTGRAY); doc.rect(m, y, cW, 0.5, "F"); y += 6; }

  function callout(text: string) {
    checkPage(20);
    setFill(LTGRAY); doc.rect(m, y - 4, cW, 16, "F");
    doc.setFont("helvetica", "italic"); doc.setFontSize(10); setColor(TEAL);
    const lines = doc.splitTextToSize(text, cW - 16);
    doc.text(lines, m + 8, y); y += lines.length * 5 + 10;
  }

  function keyInsight(text: string) {
    checkPage(18);
    doc.setDrawColor(...GOLD); doc.setLineWidth(1);
    doc.line(m, y - 2, m, y + 12);
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); setColor(GOLD);
    doc.text("KEY INSIGHT", m + 5, y);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); setColor(NAVY);
    const lines = doc.splitTextToSize(text, cW - 10);
    doc.text(lines, m + 5, y + 5); y += lines.length * 4.5 + 12;
  }

  function pageNum() {
    const pg = doc.getNumberOfPages();
    for (let i = 2; i <= pg; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "normal"); doc.setFontSize(8); setColor(GRAY);
      doc.text(`${i}`, W / 2, H - 10, { align: "center" });
      doc.text("doge-consulting.com", W - m, H - 10, { align: "right" });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // COVER PAGE
  // ═══════════════════════════════════════════════════════════════
  setFill(NAVY); doc.rect(0, 0, W, H, "F");

  // Top accent bar
  setFill(TEAL); doc.rect(0, 0, W, 4, "F");

  doc.setFont("helvetica", "normal"); doc.setFontSize(10);
  setColor([200, 200, 200]);
  doc.text("DOGE CONSULTING GROUP LIMITED", m, 35);

  doc.setFont("helvetica", "bold"); doc.setFontSize(40); setColor(WHITE);
  doc.text("The China", m, 70);
  doc.text("Sourcing", m, 86);
  doc.text("Playbook", m, 102);

  doc.setFont("helvetica", "normal"); doc.setFontSize(16); setColor(GOLD);
  doc.text("How to Build a Profitable", m, 125);
  doc.text("Import Business in 2026", m, 135);

  doc.setFontSize(11); setColor([180, 180, 180]);
  doc.text("A comprehensive guide to sourcing, shipping, and", m, 160);
  doc.text("selling Chinese-manufactured goods in North America", m, 169);

  // Stats on cover
  y = 200;
  setFill([30, 40, 60]); doc.rect(m, y - 8, cW, 35, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(20);
  const coverStats = [
    { v: "$308B", l: "US imports from\nChina (2025)" },
    { v: "3-6x", l: "Factory to retail\nmarkup" },
    { v: "$1.3T", l: "Cross-border\ne-comm by 2030" },
    { v: "40-60%", l: "Average savings\nvs US retail" },
  ];
  const sw = cW / 4;
  coverStats.forEach((s, i) => {
    setColor(TEAL);
    doc.setFontSize(18); doc.setFont("helvetica", "bold");
    doc.text(s.v, m + i * sw + sw / 2, y + 4, { align: "center" });
    doc.setFontSize(7); doc.setFont("helvetica", "normal"); setColor([180, 180, 180]);
    doc.text(s.l, m + i * sw + sw / 2, y + 12, { align: "center" });
  });

  setFill(TEAL); doc.rect(0, H - 4, W, 4, "F");
  doc.setFontSize(9); setColor([120, 120, 120]);
  doc.text("March 2026  |  doge-consulting.com  |  Seattle, WA & Hong Kong SAR", m, H - 12);

  // ═══════════════════════════════════════════════════════════════
  // TABLE OF CONTENTS
  // ═══════════════════════════════════════════════════════════════
  newPage();
  doc.setFont("helvetica", "bold"); doc.setFontSize(28); setColor(NAVY);
  doc.text("Table of Contents", m, y); y += 20;

  const chapters = [
    "Executive Summary",
    "The China Manufacturing Landscape",
    "The Opportunity: 3-6x Markups",
    "Three Business Models That Work",
    "The Complete Logistics Chain",
    "Customs, Duties & Tariff Strategy",
    "Finding & Vetting Suppliers",
    "Product Selection & Trend Identification",
    "Marketing & Selling Imported Goods",
    "AI-Powered Import Business Playbook",
    "Risk Management & Compliance",
    "Your 90-Day Action Plan",
    "Appendix: AI Prompts for Import Business",
  ];
  chapters.forEach((ch, i) => {
    doc.setFont("helvetica", "normal"); doc.setFontSize(12);
    setColor(i === 0 ? TEAL : NAVY);
    doc.text(`${String(i + 1).padStart(2, "0")}`, m, y);
    doc.text(ch, m + 14, y);
    y += 9;
  });

  // ═══════════════════════════════════════════════════════════════
  // CHAPTER 1: EXECUTIVE SUMMARY
  // ═══════════════════════════════════════════════════════════════
  newPage();
  setFill(TEAL); doc.rect(0, 0, W, 3, "F");
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); setColor(TEAL);
  doc.text("CHAPTER 01", m, 20); y = 30;

  h1("Executive Summary");
  p("The global trade landscape is undergoing its most significant transformation in decades. The US-China trade relationship, worth $414 billion in imports in 2025, remains one of the most consequential economic corridors in the world. Despite tariff escalation, Section 301 duties, and shifting trade policies, China continues to be the world\u2019s dominant manufacturing powerhouse \u2014 producing 28-30% of all global manufactured goods.");
  y += 3;
  p("This playbook provides a comprehensive, data-driven guide for entrepreneurs, businesses, and individual importers seeking to build profitable import operations sourcing from China. Drawing on the latest trade data from the US Census Bureau, policy analysis from McKinsey and Flexport, and freight market intelligence from Freightos, we present actionable strategies for identifying high-margin products, navigating customs, and building sustainable businesses.");
  y += 3;

  keyInsight("The typical markup from Chinese factory price to US retail is 3-6x. Even after shipping, duties, and tariffs, importers retain 15-35% net profit margins on well-selected products.");

  y += 3;
  h3("Key Findings");
  bullet("US imports from China totaled $308.4B in 2025 \u2014 down 30% from 2024 due to tariff pressure, but still a massive trade corridor");
  bullet("Cross-border e-commerce is projected to grow from $500B (2024) to $1.3T by 2030 \u2014 a 17% CAGR");
  bullet("The US weighted-average tariff rate rose from ~2% to >20% \u2014 the highest in 100 years \u2014 creating both challenges and opportunities");
  bullet("IEEPA tariffs were struck down by the Supreme Court (Feb 2026), with $90B+ in potential refunds");
  bullet("Three proven business models \u2014 Amazon FBA, DTC, and wholesale \u2014 can generate $10K-$100K/month");
  bullet("Minimum startup investment: $3,000-$15,000 for a viable import business");

  // ═══════════════════════════════════════════════════════════════
  // CHAPTER 2: CHINA MANUFACTURING LANDSCAPE
  // ═══════════════════════════════════════════════════════════════
  newPage();
  setFill(TEAL); doc.rect(0, 0, W, 3, "F");
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); setColor(TEAL);
  doc.text("CHAPTER 02", m, 20); y = 30;

  h1("The China Manufacturing Landscape");
  h2("A $3.7 Trillion Production Machine");
  p("China\u2019s manufacturing sector generated $3.7 trillion in real manufacturing value added in 2024 \u2014 more than the US, South Korea, Germany, and the UK combined. With 773 million workers (the world\u2019s largest labor force), three of the busiest container ports, and the world\u2019s largest high-speed rail network, China\u2019s manufacturing infrastructure is unparalleled.");
  y += 3;

  h3("China\u2019s Competitive Advantages");
  bullet("28-30% of global manufacturing output (UNIDO)");
  bullet("$3.77 trillion in annual exports (2025)");
  bullet("90% of world\u2019s rare earth production");
  bullet("142 Fortune Global 500 companies headquartered in China");
  bullet("Two of the world\u2019s top 5 science and technology clusters");
  bullet("Guangdong Province alone has GDP of $2.1 trillion \u2014 larger than many countries");
  y += 5;

  h2("Manufacturing Hub Directory");
  p("Understanding which city makes what is critical for sourcing. Here is the definitive guide:");
  y += 3;

  const hubW = [35, 35, 50, 50];
  tableRow(["City", "Province", "Specialization", "Key Products"], hubW, true);
  tableRow(["Shenzhen", "Guangdong", "Electronics/Tech", "Phones, drones, EVs, IoT"], hubW);
  tableRow(["Dongguan", "Guangdong", "OEM/ODM Mfg", "Shoes (Nike), electronics, toys"], hubW);
  tableRow(["Foshan", "Guangdong", "Furniture/Ceramics", "Marble tables, tiles, lighting"], hubW);
  tableRow(["Guangzhou", "Guangdong", "Textiles/Fashion", "Garments, fabrics, leather"], hubW);
  tableRow(["Yiwu", "Zhejiang", "Small Commodities", "Toys, accessories, Xmas decor"], hubW);
  tableRow(["Hangzhou", "Zhejiang", "E-Commerce/Tech", "Alibaba HQ, silk, SaaS"], hubW);
  tableRow(["Zhongshan", "Guangdong", "LED Lighting", "6,000+ lighting factories"], hubW);
  tableRow(["Shantou", "Guangdong", "Toys", "Action figures, plush toys"], hubW);
  tableRow(["Wenzhou", "Zhejiang", "Footwear/Leather", "Shoe capital of China"], hubW);
  tableRow(["Ningbo", "Zhejiang", "Auto/Plastics", "Major export port"], hubW);
  tableRow(["Quanzhou", "Fujian", "Sportswear", "Anta, 361\u00b0, Peak brands"], hubW);
  tableRow(["Jieyang", "Guangdong", "Kitchenware", "Stainless steel capital"], hubW);
  y += 5;

  keyInsight("The Pearl River Delta (Shenzhen, Dongguan, Guangzhou, Foshan) alone produces more manufactured goods than most countries. A one-week trip to this region can connect you with factories serving Nike, Apple, Samsung, and IKEA.");

  // ═══════════════════════════════════════════════════════════════
  // CHAPTER 3: THE OPPORTUNITY
  // ═══════════════════════════════════════════════════════════════
  newPage();
  setFill(TEAL); doc.rect(0, 0, W, 3, "F");
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); setColor(TEAL);
  doc.text("CHAPTER 03", m, 20); y = 30;

  h1("The Opportunity: 3-6x Markups");
  h2("Factory Price vs. US Retail Analysis");
  p("The core of the import opportunity is the massive price gap between Chinese factory costs and North American retail prices. This gap exists because of: (1) lower manufacturing labor costs, (2) economies of scale, (3) mature supply chains, and (4) high retail markups by US distributors and brands.");
  y += 3;

  const priceW = [42, 30, 30, 22, 22, 24];
  tableRow(["Product", "Factory", "US Retail", "Markup", "Margin", "Duty"], priceW, true);
  tableRow(["Office Chair", "$30-60", "$150-350", "3-5x", "65-75%", "0%"], priceW);
  tableRow(["Bluetooth Earbuds", "$3-8", "$25-60", "4-6x", "70-80%", "0%"], priceW);
  tableRow(["Phone Case", "$0.30-1.50", "$10-25", "8-12x", "85-95%", "0%"], priceW);
  tableRow(["Marble Dining Table", "$400-800", "$2K-4K", "3-5x", "60-75%", "0%"], priceW);
  tableRow(["LED Strip (5m)", "$1-3", "$12-25", "5-8x", "75-85%", "3.9%"], priceW);
  tableRow(["Standing Desk", "$80-150", "$350-800", "3-4x", "60-70%", "0%"], priceW);
  tableRow(["Dog Bed", "$3-8", "$25-60", "3-5x", "60-80%", "4.4%"], priceW);
  tableRow(["Yoga Mat", "$2-5", "$20-45", "5-8x", "75-85%", "4.2%"], priceW);
  tableRow(["Kitchen Knife Set", "$5-15", "$40-120", "4-5x", "65-80%", "0%"], priceW);
  tableRow(["Children\u2019s Toy", "$1-5", "$15-35", "5-7x", "70-85%", "0%"], priceW);
  tableRow(["Ceramic Dinnerware", "$8-20", "$50-150", "4-6x", "70-85%", "9.8%"], priceW);
  tableRow(["Smart Watch", "$8-20", "$40-120", "3-5x", "60-75%", "0%"], priceW);
  tableRow(["Pet Carrier", "$5-15", "$30-70", "3-5x", "65-80%", "4%"], priceW);
  tableRow(["Sunglasses", "$0.50-2", "$10-25", "10-15x", "85-95%", "2%"], priceW);
  y += 3;

  callout("Source: Alibaba.com factory listings vs Amazon.com retail prices, compiled March 2026. Duties shown are base US tariff rates (Chapter-level HTS). Section 301 tariffs of 7.5-25% may apply additionally.");

  p("Note: Even with the current ~40% effective tariff rate on Chinese goods (15% Section 122 + 25% Section 301), the 3-6x markup still yields strong profits. A $10 product costing $14 landed (including $4 in duties) can sell for $30-50 retail.");
  y += 3;

  h2("Total Addressable Market");
  p("The opportunity is massive and growing:");
  bullet("US imports from China: $308.4 billion (2025) \u2014 down from $439B but still enormous");
  bullet("Cross-border e-commerce: $500B globally (2024) \u2192 $1.3T by 2030 (McKinsey)");
  bullet("US e-commerce: $1.1 trillion in 2025, with 60%+ of Amazon third-party sellers sourcing from China");
  bullet("Global home furnishing market: $616B by 2027");
  bullet("US pet industry: $150B annually, growing 6-8%/year");

  // ═══════════════════════════════════════════════════════════════
  // CHAPTER 4: BUSINESS MODELS
  // ═══════════════════════════════════════════════════════════════
  newPage();
  setFill(TEAL); doc.rect(0, 0, W, 3, "F");
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); setColor(TEAL);
  doc.text("CHAPTER 04", m, 20); y = 30;

  h1("Three Business Models That Work");
  p("Based on analysis of successful importers, three models consistently generate sustainable revenue:");
  y += 5;

  // Model 1
  h2("Model 1: Amazon FBA Private Label");
  p("The most accessible model for beginners. You source products from China, brand them with your logo, and ship directly to Amazon\u2019s fulfillment centers.");
  y += 2;
  h3("Unit Economics");
  const fbaW = [55, 55, 60];
  tableRow(["Cost Component", "Per Unit", "Notes"], fbaW, true);
  tableRow(["Product cost (FOB)", "$2-$8", "Factory price at Chinese port"], fbaW);
  tableRow(["Ocean freight + duties", "$0.50-$3", "~40% tariff included"], fbaW);
  tableRow(["Landed cost", "$3-$11", "Your true cost basis"], fbaW);
  tableRow(["Amazon selling price", "$15-$40", "Target BSR < 10,000"], fbaW);
  tableRow(["FBA fees (pick/pack)", "$3-$7", "Size/weight dependent"], fbaW);
  tableRow(["Referral fee (15%)", "$2.25-$6", "Category dependent"], fbaW);
  tableRow(["PPC advertising", "$1-$3", "Per unit sold"], fbaW);
  tableRow(["Net profit/unit", "$2-$12", "15-35% net margin"], fbaW);
  y += 3;
  pb("Startup cost: $3,000-$10,000 | Time to first sale: 2-3 months | Scale: $5K-$50K/month in year 1");
  y += 5;

  // Model 2
  h2("Model 2: Direct-to-Consumer (Shopify/Own Store)");
  p("Build your own brand and website. Higher margins than Amazon (no 15% referral fee), but requires marketing investment and brand building.");
  y += 2;
  bullet("Startup cost: $5,000-$15,000");
  bullet("Net margin: 25-45% (vs 15-35% on Amazon)");
  bullet("Requires Facebook/Google ad spend: $500-$2,000/month initially");
  bullet("You own the customer data and relationship");
  bullet("Scale: $10K-$100K/month within 12-18 months");
  y += 3;
  keyInsight("Many successful importers start with Amazon FBA to validate their product, then launch a Shopify store to capture higher-margin direct sales.");

  // Model 3
  h2("Model 3: Wholesale / B2B Distribution");
  p("Import in bulk and sell to US retailers, contractors, or institutional buyers. Lower per-unit margins but higher per-transaction volume.");
  bullet("Startup cost: $10,000-$50,000");
  bullet("Net margin: 15-25%");
  bullet("Key channels: Trade shows, cold outreach, industry networks");
  bullet("Best for: Furniture, industrial goods, building materials, commercial equipment");
  bullet("Scale: $50K-$500K/month for established distributors");

  // ═══════════════════════════════════════════════════════════════
  // CHAPTER 5: LOGISTICS
  // ═══════════════════════════════════════════════════════════════
  newPage();
  setFill(TEAL); doc.rect(0, 0, W, 3, "F");
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); setColor(TEAL);
  doc.text("CHAPTER 05", m, 20); y = 30;

  h1("The Complete Logistics Chain");
  h2("12 Steps: Chinese Factory to American Doorstep");
  p("Understanding the full supply chain is essential for cost optimization and risk management. Here is the complete journey:");
  y += 3;

  const steps = [
    ["1. Product Sourcing", "Identify manufacturers via Alibaba, 1688, Canton Fair, or agents", "Variable"],
    ["2. Sample Ordering", "Request 3-5 samples for quality comparison", "7-14 days"],
    ["3. Production", "Factory manufactures your goods to specification", "15-45 days"],
    ["4. Quality Inspection", "Third-party inspector checks at factory (AQL 2.5)", "1-2 days"],
    ["5. Export Documentation", "Commercial invoice, packing list, bill of lading", "1-3 days"],
    ["6. Domestic Transport", "Trucked from factory to Chinese port", "1-3 days"],
    ["7. Chinese Export Customs", "Export clearance at Shenzhen/Shanghai/Ningbo", "1-2 days"],
    ["8. Ocean Freight", "Container crosses Pacific Ocean", "14-35 days"],
    ["9. US Port Arrival", "Arrives at LA, Oakland, Seattle, NY/NJ", "\u2014"],
    ["10. US Customs Clearance", "CBP reviews documents, assesses duties", "1-5 days"],
    ["11. Drayage + Distribution", "Container to warehouse or Amazon FBA", "1-3 days"],
    ["12. Last Mile Delivery", "UPS/FedEx/USPS to customer\u2019s door", "1-5 days"],
  ];
  const stepW = [40, 90, 30];
  tableRow(["Step", "Description", "Timeline"], stepW, true);
  steps.forEach(s => tableRow(s, stepW));
  y += 5;

  pb("Total timeline: 6-12 weeks door-to-door (typical 8 weeks)");
  y += 5;

  h2("Shipping Methods Compared");
  const shipW = [35, 30, 30, 75];
  tableRow(["Method", "Transit", "Cost/kg", "Best For"], shipW, true);
  tableRow(["Ocean FCL", "20-35 days", "$0.10-0.50", "Large orders filling 1+ container"], shipW);
  tableRow(["Ocean LCL", "25-40 days", "$0.30-1.00", "Small orders sharing a container"], shipW);
  tableRow(["Air Freight", "3-7 days", "$4-8", "Urgent, high-value, lightweight items"], shipW);
  tableRow(["Express", "3-5 days", "$6-12", "Samples, small parcels, testing"], shipW);
  y += 5;

  h3("Container Sizes Reference");
  bullet("20ft: ~33 CBM, max 28,000 kg, cost $2,000-$3,500");
  bullet("40ft: ~67 CBM, max 28,000 kg, cost $3,000-$5,000");
  bullet("40ft HC: ~76 CBM, max 28,000 kg, cost $3,500-$5,500");
  y += 3;

  keyInsight("FCL becomes cheaper than LCL at approximately 15 CBM \u2014 about half a 20ft container. Use our free CBM calculator at doge-consulting.com/tools/cbm-calculator to estimate your volume.");

  // ═══════════════════════════════════════════════════════════════
  // CHAPTER 6: CUSTOMS & TARIFFS
  // ═══════════════════════════════════════════════════════════════
  newPage();
  setFill(TEAL); doc.rect(0, 0, W, 3, "F");
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); setColor(TEAL);
  doc.text("CHAPTER 06", m, 20); y = 30;

  h1("Customs, Duties & Tariff Strategy");
  h2("The 2026 Tariff Landscape");
  p("The US tariff environment has undergone dramatic shifts. Here is the current state as of March 2026:");
  y += 3;

  h3("Current Tariff Layers on Chinese Goods");
  bullet("Base tariff: 0-32% depending on HTS code (most furniture/electronics = 0%)");
  bullet("Section 301 tariffs: Up to 25% additional (most Chinese manufactured goods)");
  bullet("Section 122 global tariff: 15% (effective Feb 24 - Jul 24, 2026)");
  bullet("IEEPA tariffs: STRUCK DOWN by Supreme Court (Feb 20, 2026) \u2014 $90B+ in refunds pending");
  bullet("Effective combined rate on most Chinese goods: approximately 40%");
  y += 3;

  callout("LANDMARK: On February 20, 2026, the US Supreme Court ruled 6-3 that IEEPA permits import regulation but does not authorize duties. The Court of International Trade ordered universal refund of all IEEPA duties collected. \u2014 Flexport, March 2026");

  h3("Key Trade Policy Timeline");
  bullet("Apr 2025: US average tariff rose from ~2% to >20% \u2014 highest in 100 years (McKinsey)");
  bullet("May 2025: De minimis eliminated for China/HK \u2192 daily exempt volume dropped 85%+");
  bullet("Aug 2025: De minimis eliminated for ALL countries");
  bullet("Oct 2025: Trump-Xi deal \u2014 fentanyl tariff 20%\u219210%, combined ~45%");
  bullet("Feb 2026: Supreme Court strikes down IEEPA tariffs");
  bullet("Feb 2026: Section 122 tariff of 15% enacted (expires Jul 2026)");
  y += 3;

  h2("Required Documents for US Import");
  bullet("Commercial Invoice \u2014 value, quantity, description");
  bullet("Packing List \u2014 detailed cargo contents");
  bullet("Bill of Lading (B/L) \u2014 shipping contract");
  bullet("ISF (10+2) \u2014 filed 24 hours before departure, penalty $5K-$10K if late");
  bullet("Customs Bond \u2014 required for shipments over $2,500");
  bullet("Certificate of Origin \u2014 country of manufacture proof");
  y += 3;

  h2("Duty Optimization Strategies");
  bullet("Correct HTS classification \u2014 small reclassifications can save thousands");
  bullet("First Sale Rule \u2014 use manufacturer\u2019s price (not trading company\u2019s) as customs value");
  bullet("Foreign Trade Zones \u2014 defer duties until goods enter US commerce");
  bullet("Duty drawback \u2014 recover 99% of duties on re-exported goods");
  bullet("Section 301 exclusions \u2014 check USTR exclusion lists for your specific products");

  keyInsight("Use our free duty calculator at doge-consulting.com/tools/duty-calculator to estimate your total landed cost including all tariff layers.");

  // ═══════════════════════════════════════════════════════════════
  // CHAPTER 7: FINDING SUPPLIERS
  // ═══════════════════════════════════════════════════════════════
  newPage();
  setFill(TEAL); doc.rect(0, 0, W, 3, "F");
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); setColor(TEAL);
  doc.text("CHAPTER 07", m, 20); y = 30;

  h1("Finding & Vetting Suppliers");
  h2("Where to Find Chinese Suppliers");
  p("The supplier landscape is vast. Here are the primary channels, ranked by reliability:");
  y += 3;

  h3("Online Platforms");
  bullet("Alibaba.com \u2014 200K+ manufacturers, largest B2B platform. Use \u2018Verified Manufacturer\u2019 + \u2018Trade Assurance\u2019 filters");
  bullet("1688.com \u2014 China\u2019s domestic wholesale platform. 20-40% cheaper than Alibaba but requires a Chinese agent");
  bullet("Made-in-China.com \u2014 Strong for industrial/electronic products");
  bullet("Global Sources \u2014 Higher-quality verified suppliers, HK electronics fairs");
  y += 2;
  h3("Offline Channels");
  bullet("Canton Fair (Guangzhou, Apr & Oct) \u2014 25,000+ exhibitors, world\u2019s largest trade fair");
  bullet("Yiwu International Trade Market \u2014 75,000 booths, walk-in wholesale");
  bullet("Industry-specific fairs \u2014 Furniture Fair (Dongguan), Guzhen Lighting Fair (Zhongshan)");
  bullet("Sourcing agents (like Doge Consulting) \u2014 we find, vet, and manage factories for you");
  y += 5;

  h2("The Supplier Vetting Process");
  pb("Step 1: Initial Screening");
  bullet("Request business license \u2014 verify on China\u2019s SAIC website");
  bullet("Ask for factory photos and video tours \u2014 distinguish factories from trading companies");
  bullet("Check export history \u2014 ask for client references and sample shipments");
  y += 2;
  pb("Step 2: Sample Evaluation");
  bullet("Order samples from 3-5 suppliers \u2014 budget $200-$500");
  bullet("Compare quality, packaging, and communication responsiveness");
  bullet("Test durability, materials, and finish quality");
  y += 2;
  pb("Step 3: Trial Order");
  bullet("Start with 200-500 units to test the full supply chain");
  bullet("Use Trade Assurance (Alibaba\u2019s buyer protection) for first orders");
  bullet("Arrange third-party inspection before shipping (QIMA, V-Trust: $200-$500)");
  y += 2;
  pb("Step 4: Scale the Relationship");
  bullet("Negotiate better pricing and terms as volume increases");
  bullet("Shift to 30/70 payment terms (30% deposit, 70% before shipping)");
  bullet("Consider factory exclusivity for private label products");
  y += 3;

  h2("Red Flags to Avoid");
  bullet("No factory photos \u2014 likely a trading company with higher prices");
  bullet("Price too good to be true \u2014 quality will inevitably suffer");
  bullet("Won\u2019t send samples \u2014 hiding quality issues");
  bullet("Pushes for Western Union/MoneyGram \u2014 potential scam indicator");
  bullet("No business license displayed \u2014 may not be legally registered");

  // ═══════════════════════════════════════════════════════════════
  // CHAPTER 8: PRODUCT SELECTION
  // ═══════════════════════════════════════════════════════════════
  newPage();
  setFill(TEAL); doc.rect(0, 0, W, 3, "F");
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); setColor(TEAL);
  doc.text("CHAPTER 08", m, 20); y = 30;

  h1("Product Selection & Trend Identification");
  h2("The Product Selection Framework");
  p("Choosing the right product is the single most important decision in your import business. Use this framework:");
  y += 3;

  h3("The 7 Criteria for Winning Products");
  bullet("1. Selling price $15-$50 (sweet spot for online sales)");
  bullet("2. Lightweight (<2 lbs) to minimize shipping and FBA fees");
  bullet("3. Not dominated by major brands (room for private labels)");
  bullet("4. At least 300 units/month sold by top sellers (proven demand)");
  bullet("5. Low return rate (<5%) \u2014 avoid fragile items and clothing initially");
  bullet("6. Room for improvement \u2014 read negative reviews of existing products");
  bullet("7. Low regulatory burden \u2014 avoid FDA, FCC, CPSIA-regulated items initially");
  y += 5;

  h2("How to Identify Trending Products");
  h3("Tools for Product Research");
  bullet("Amazon Best Sellers \u2014 browse top 100 in each category, track BSR trends");
  bullet("Google Trends \u2014 verify growing search interest over 12+ months");
  bullet("Jungle Scout / Helium 10 \u2014 Amazon product databases with sales estimates and competition metrics");
  bullet("TikTok/Instagram trending products \u2014 social commerce drives product discovery");
  bullet("Alibaba.com trending searches \u2014 see what other buyers are sourcing");
  y += 3;

  h3("2026 High-Demand Product Categories");
  bullet("Home office equipment (standing desks, ergonomic chairs, monitor arms)");
  bullet("Pet products (beds, toys, smart feeders, grooming tools)");
  bullet("Smart home devices (WiFi plugs, sensors, cameras, LED strips)");
  bullet("Kitchen gadgets (air fryer accessories, organizers, premium utensils)");
  bullet("Fitness accessories (resistance bands, yoga equipment, recovery tools)");
  bullet("Sustainable/eco products (bamboo kitchenware, reusable bags, solar items)");
  bullet("Car accessories (phone mounts, organizers, LED upgrades)");
  bullet("Children\u2019s educational toys (STEM toys, building sets, art supplies)");

  keyInsight("The best products solve specific problems or improve daily life. Look for items with 3-4 star average reviews where you can make a better version \u2014 that\u2019s your competitive moat.");

  // ═══════════════════════════════════════════════════════════════
  // CHAPTER 9: MARKETING
  // ═══════════════════════════════════════════════════════════════
  newPage();
  setFill(TEAL); doc.rect(0, 0, W, 3, "F");
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); setColor(TEAL);
  doc.text("CHAPTER 09", m, 20); y = 30;

  h1("Marketing & Selling Imported Goods");
  h2("Sales Channel Strategy");
  p("Your choice of sales channel determines your margin structure, customer reach, and brand-building potential:");
  y += 3;

  const chanW = [35, 28, 28, 30, 49];
  tableRow(["Channel", "Margin", "Startup", "Reach", "Best For"], chanW, true);
  tableRow(["Amazon FBA", "15-35%", "$3K-10K", "300M+", "Beginners, volume"], chanW);
  tableRow(["Shopify DTC", "25-45%", "$5K-15K", "Variable", "Brand builders"], chanW);
  tableRow(["Wholesale", "15-25%", "$10K-50K", "B2B", "Large orders"], chanW);
  tableRow(["Etsy", "20-35%", "$1K-5K", "95M", "Unique/handmade"], chanW);
  tableRow(["TikTok Shop", "20-40%", "$2K-8K", "150M+", "Viral products"], chanW);
  tableRow(["Walmart MP", "15-30%", "$3K-10K", "120M+", "Price-sensitive"], chanW);
  y += 5;

  h2("Marketing Playbook for Each Channel");
  h3("Amazon: The Launch Formula");
  bullet("Optimize listing: professional photos, keyword-rich title, A+ content");
  bullet("Run Amazon PPC campaigns: $10-$30/day initially");
  bullet("Enroll in Amazon Vine for early reviews");
  bullet("Price competitively during launch, raise after 50+ reviews");
  bullet("Target ACoS (advertising cost of sale) under 25%");
  y += 3;

  h3("Shopify DTC: The Brand Builder");
  bullet("Facebook/Instagram ads: target lookalike audiences of competitor customers");
  bullet("TikTok organic: create product demo videos (80% of viral products start here)");
  bullet("Google Shopping ads for high-intent searchers");
  bullet("Email marketing: capture emails with a lead magnet (like this playbook!)");
  bullet("Influencer partnerships: micro-influencers (10K-50K followers) have best ROI");
  y += 3;

  h3("International Markets");
  p("Don\u2019t limit yourself to the US. Chinese-sourced goods sell well globally:");
  bullet("Canada, UK, Australia, Germany \u2014 strong e-commerce markets with fewer competitors");
  bullet("Amazon has marketplaces in 20+ countries \u2014 replicate your US success internationally");
  bullet("Shopify supports 175+ countries with multi-currency checkout");

  // ═══════════════════════════════════════════════════════════════
  // CHAPTER 10: AI PLAYBOOK
  // ═══════════════════════════════════════════════════════════════
  newPage();
  setFill(TEAL); doc.rect(0, 0, W, 3, "F");
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); setColor(TEAL);
  doc.text("CHAPTER 10", m, 20); y = 30;

  h1("AI-Powered Import Business Playbook");
  h2("Leveraging AI to Accelerate Your Import Business");
  p("Artificial intelligence is transforming every aspect of import businesses \u2014 from product research to customer service. Here\u2019s how to use AI tools as your unfair advantage:");
  y += 3;

  h3("AI for Product Research");
  bullet("Use ChatGPT/Claude to analyze Amazon review data and identify product improvement opportunities");
  bullet("Ask AI to analyze Google Trends data and predict seasonal demand patterns");
  bullet("Generate product differentiation ideas by analyzing competitor weaknesses");
  y += 2;

  h3("AI for Supplier Communication");
  bullet("Translate complex technical specifications into Chinese for factories");
  bullet("Draft professional RFQ (Request for Quotation) emails");
  bullet("Create detailed tech packs and product specifications");
  y += 2;

  h3("AI for Marketing");
  bullet("Generate optimized Amazon listing titles, bullet points, and descriptions");
  bullet("Create ad copy for Facebook, Google, and TikTok campaigns");
  bullet("Build email marketing sequences for customer retention");
  bullet("Analyze competitor pricing strategies");
  y += 2;

  h3("AI for Operations");
  bullet("Customs classification \u2014 identify correct HTS codes using AI");
  bullet("Demand forecasting \u2014 predict reorder timing based on sales velocity");
  bullet("Customer service automation \u2014 chatbots for common inquiries");
  y += 3;

  keyInsight("Flexport announced AI agents for automated customs processing in their 2026 Winter Release. The companies that adopt AI-powered supply chain tools earliest will have significant cost and speed advantages.");

  // ═══════════════════════════════════════════════════════════════
  // CHAPTER 11: RISK MANAGEMENT
  // ═══════════════════════════════════════════════════════════════
  newPage();
  setFill(TEAL); doc.rect(0, 0, W, 3, "F");
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); setColor(TEAL);
  doc.text("CHAPTER 11", m, 20); y = 30;

  h1("Risk Management & Compliance");
  h2("Understanding and Mitigating Import Risks");
  p("Every import business faces risks. Here\u2019s how to manage them:");
  y += 3;

  h3("Quality Risk");
  bullet("Always inspect before shipping \u2014 third-party QC costs $200-$500, saving you $2,000-$20,000 in returns");
  bullet("Agree on quality standards in writing before production starts");
  bullet("Request production photos at key stages (raw materials, mid-production, pre-shipment)");
  bullet("Hold 30% of payment until post-inspection approval");
  y += 3;

  h3("Logistics Risk");
  bullet("Insure every shipment \u2014 cargo insurance costs 0.5-2% of goods value");
  bullet("Build buffer time into your inventory planning (add 2 weeks to quoted transit)");
  bullet("Monitor geopolitical events \u2014 Red Sea disruptions added 7-14 days to routes in 2024-2026");
  bullet("Diversify shipping routes \u2014 don\u2019t rely on a single port or carrier");
  y += 3;

  h3("Tariff & Regulatory Risk");
  bullet("Stay current on Section 301 exclusion lists \u2014 your product may qualify for exemption");
  bullet("Work with a licensed customs broker for every entry");
  bullet("Ensure products meet US safety standards: FCC (electronics), UL (electrical), CPSIA (children\u2019s)");
  bullet("Maintain proper records for 5 years (CBP audit requirement)");
  y += 3;

  h3("Financial Risk");
  bullet("Start small: 200-500 units maximum on first order");
  bullet("Use Trade Assurance or Letter of Credit for orders over $10,000");
  bullet("Don\u2019t invest more than you can afford to lose on your first product");
  bullet("Build a 3-month cash reserve before scaling");

  // ═══════════════════════════════════════════════════════════════
  // CHAPTER 12: 90-DAY ACTION PLAN
  // ═══════════════════════════════════════════════════════════════
  newPage();
  setFill(TEAL); doc.rect(0, 0, W, 3, "F");
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); setColor(TEAL);
  doc.text("CHAPTER 12", m, 20); y = 30;

  h1("Your 90-Day Action Plan");
  p("Here is your week-by-week roadmap from zero to your first profitable import:");
  y += 5;

  h2("Weeks 1-2: Research & Planning");
  bullet("Define your niche and target market");
  bullet("Research 20+ products using Amazon BSR, Google Trends, and Jungle Scout");
  bullet("Calculate landed costs for your top 5 product ideas using our duty calculator");
  bullet("Set up your business entity (LLC recommended, ~$100-$500)");
  bullet("Open a business bank account");
  y += 3;

  h2("Weeks 3-4: Supplier Outreach");
  bullet("Contact 10-15 suppliers on Alibaba for your top 3 products");
  bullet("Request pricing, MOQ, and lead times from each");
  bullet("Order samples from the top 3-5 suppliers ($200-$500 budget)");
  bullet("While waiting for samples, create your Amazon Seller account or Shopify store");
  y += 3;

  h2("Weeks 5-6: Evaluate & Decide");
  bullet("Compare samples: quality, packaging, and supplier communication");
  bullet("Select your winning product and supplier");
  bullet("Negotiate final pricing, MOQ, and payment terms");
  bullet("Place your first order (200-500 units recommended)");
  bullet("Arrange freight forwarding (contact Doge Consulting for a free quote)");
  y += 3;

  h2("Weeks 7-10: Production & Shipping");
  bullet("Monitor production progress with factory updates");
  bullet("Arrange pre-shipment quality inspection");
  bullet("Factory ships to port, freight forwarder handles ocean freight");
  bullet("While goods are in transit: create product listing, take professional photos");
  y += 3;

  h2("Weeks 11-12: Launch & Sell");
  bullet("Customs clearance and delivery to your warehouse or Amazon FBA");
  bullet("Activate your listing and start PPC campaigns");
  bullet("Monitor sales velocity and customer feedback");
  bullet("Plan your reorder when you have 6-8 weeks of inventory remaining");
  y += 5;

  callout("After 90 days, you should have your first product listed and selling. Most successful importers reach profitability within 3-6 months and scale to $10K+/month within 12 months.");

  // ═══════════════════════════════════════════════════════════════
  // CHAPTER 13: AI PROMPTS APPENDIX
  // ═══════════════════════════════════════════════════════════════
  newPage();
  setFill(TEAL); doc.rect(0, 0, W, 3, "F");
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); setColor(TEAL);
  doc.text("APPENDIX", m, 20); y = 30;

  h1("AI Prompts for Your Import Business");
  p("Copy and paste these prompts into ChatGPT, Claude, or your preferred AI assistant to kickstart each phase of your import business:");
  y += 5;

  h3("Prompt 1: Product Research");
  callout("\"I want to start an import business sourcing products from China to sell on Amazon in the US. Help me identify 10 product opportunities that meet these criteria: selling price $15-$50, lightweight (under 2 lbs), not dominated by major brands, and have at least 300 units/month demand. For each product, estimate the factory cost, landed cost, and potential profit margin. Focus on products in the [HOME/PET/KITCHEN/FITNESS] category.\"");

  h3("Prompt 2: Supplier Outreach Email");
  callout("\"Write a professional email to a Chinese manufacturer on Alibaba. I want to inquire about [PRODUCT NAME]. Ask for: (1) FOB pricing for 500 and 1000 units, (2) MOQ, (3) lead time, (4) whether they can do OEM/private label with my logo, (5) product certifications available. Be professional but direct. Include that I am looking for a long-term supplier relationship.\"");

  h3("Prompt 3: Amazon Listing Optimization");
  callout("\"Create an optimized Amazon product listing for [PRODUCT NAME]. Include: (1) A keyword-rich title under 200 characters, (2) 5 bullet points highlighting key benefits and features, (3) A product description with HTML formatting, (4) 5 backend search terms. Target keywords: [LIST YOUR KEYWORDS]. Focus on benefits, not just features. Use emotional triggers.\"");

  h3("Prompt 4: Customs Classification");
  callout("\"I am importing [DESCRIBE YOUR PRODUCT IN DETAIL] from China to the USA. Help me identify the correct HTS (Harmonized Tariff Schedule) code. Provide: (1) The most likely 10-digit HTS code, (2) The general duty rate, (3) Whether Section 301 tariffs apply, (4) Any special requirements or certifications needed, (5) An estimate of total duties as a percentage of product value.\"");

  h3("Prompt 5: Marketing Strategy");
  callout("\"I\u2019m launching a [PRODUCT NAME] brand on Amazon and Shopify. Create a 30-day launch marketing plan including: (1) Amazon PPC campaign structure with suggested daily budget, (2) Facebook/Instagram ad targeting strategy, (3) 5 social media content ideas, (4) Email marketing sequence for capturing and converting leads, (5) Influencer outreach template. My target audience is [DESCRIBE YOUR CUSTOMER].\"");

  h3("Prompt 6: Full Business Plan");
  callout("\"Create a detailed business plan for an import business sourcing [PRODUCT CATEGORY] from China and selling in the US. Include: (1) Market analysis with TAM/SAM/SOM, (2) Competitive landscape, (3) Unit economics breakdown, (4) 12-month financial projection, (5) Risk analysis with mitigation strategies, (6) Marketing and customer acquisition plan, (7) Operations and supply chain plan. Assume starting capital of $[AMOUNT].\"");

  // ═══════════════════════════════════════════════════════════════
  // BACK COVER
  // ═══════════════════════════════════════════════════════════════
  newPage();
  setFill(NAVY); doc.rect(0, 0, W, H, "F");
  setFill(TEAL); doc.rect(0, 0, W, 4, "F");

  doc.setFont("helvetica", "bold"); doc.setFontSize(28); setColor(WHITE);
  doc.text("Ready to Start Your", m, 80);
  doc.text("Import Business?", m, 96);

  doc.setFont("helvetica", "normal"); doc.setFontSize(14); setColor([200, 200, 200]);
  doc.text("Doge Consulting handles the hard parts so you can", m, 120);
  doc.text("focus on growing your business.", m, 130);

  doc.setFont("helvetica", "bold"); doc.setFontSize(12); setColor(TEAL);
  doc.text("What We Offer:", m, 155);
  doc.setFont("helvetica", "normal"); doc.setFontSize(11); setColor([200, 200, 200]);
  const offers = [
    "\u2713  Product sourcing from verified Chinese factories",
    "\u2713  Quality inspection & professional packing",
    "\u2713  Ocean freight (LCL & FCL) with real-time tracking",
    "\u2713  US customs clearance & duty optimization",
    "\u2713  Door-to-door delivery anywhere in the USA",
    "\u2713  Amazon FBA prep & direct-to-warehouse shipping",
    "\u2713  Free tools: CBM calculator, duty calculator, glossary",
  ];
  let oy = 168;
  offers.forEach(o => { doc.text(o, m, oy); oy += 9; });

  doc.setFont("helvetica", "bold"); doc.setFontSize(16); setColor(GOLD);
  doc.text("Get Your Free Quote Today", m, oy + 15);
  doc.setFont("helvetica", "normal"); doc.setFontSize(12); setColor(WHITE);
  doc.text("doge-consulting.com/quote", m, oy + 27);
  doc.text("dogetech77@gmail.com", m, oy + 38);
  doc.text("+1 (425) 223-0449", m, oy + 49);

  setFill(TEAL); doc.rect(0, H - 4, W, 4, "F");
  doc.setFontSize(8); setColor([100, 100, 100]);
  doc.text("\u00a9 2026 Doge Consulting Group Limited. All rights reserved.", m, H - 12);
  doc.text("Hong Kong SAR  |  Seattle, WA, USA  |  doge-consulting.com", m, H - 7);

  // Add page numbers
  pageNum();

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="China-Sourcing-Playbook-Doge-Consulting-2026.pdf"',
      "Content-Length": pdfBuffer.length.toString(),
    },
  });
}
