/**
 * 1688 Search Microservice
 * 
 * Standalone Node.js server that handles Playwright-based searches
 * on 1688order.com. Called by the Next.js API routes via HTTP.
 * 
 * This is separate from Next.js because Playwright doesn't work
 * inside Next.js Turbopack's server runtime.
 * 
 * Usage: node scripts/1688-search-server.mjs
 * Endpoints:
 *   POST /search    { keyword: string }        → { products: [...] }
 *   POST /image     { imageBase64: string }     → { products: [...] }
 *   GET  /health                                → { status: "ok" }
 */
import http from "http";
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import os from "os";

const PORT = process.env.SEARCH_PORT || 4688;

// ─── Singleton browser ───
let browser = null;

async function getBrowser() {
  if (!browser || !browser.isConnected()) {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-blink-features=AutomationControlled"],
    });
  }
  return browser;
}

async function createPage() {
  const b = await getBrowser();
  const context = await b.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    locale: "en-US",
  });
  const page = await context.newPage();
  await page.route("**/*.{woff,woff2,ttf}", (route) => route.abort());
  await page.route("**/gtm.js", (route) => route.abort());
  await page.route("**/gtag/**", (route) => route.abort());
  await page.route("**/fbevents.js", (route) => route.abort());
  await page.route("**/bat.bing.com/**", (route) => route.abort());
  return { page, context };
}

// ─── Search by keyword ───
async function searchByKeyword(keyword) {
  const { page, context } = await createPage();
  try {
    const url = `https://1688order.com/pc/goods_list?name=${encodeURIComponent(keyword)}&searchType=text&is_input=1`;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForSelector('a[href*="goods_details"]', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    const html = await page.content();
    return parseSearchResults(html);
  } finally {
    await context.close();
  }
}

// ─── Search by image ───
async function searchByImage(imageBase64) {
  const raw = imageBase64.replace(/^data:image\/[^;]+;base64,/, "");
  const buffer = Buffer.from(raw, "base64");
  const tempFile = path.join(os.tmpdir(), `doge-img-${Date.now()}.jpg`);
  fs.writeFileSync(tempFile, buffer);

  const { page, context } = await createPage();
  try {
    await page.goto("https://1688order.com/pc/", { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(3000);

    const fileInput = page.locator('input[type="file"]');
    if ((await fileInput.count()) === 0) {
      console.error("[1688] No file input found");
      return [];
    }

    await fileInput.setInputFiles(tempFile);
    console.log("[1688] Image uploaded, waiting for results...");

    await page.waitForURL("**/goods_list**", { timeout: 20000 }).catch(() => {
      console.error("[1688] No navigation after upload. URL:", page.url());
    });
    await page.waitForSelector('a[href*="goods_details"]', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(3000);

    let html = await page.content();
    let products = parseSearchResults(html);

    // Retry if 0 results but URL navigated
    if (products.length === 0 && page.url().includes("goods_list")) {
      await page.waitForTimeout(3000);
      html = await page.content();
      products = parseSearchResults(html);
    }

    return products;
  } finally {
    await context.close();
    try { fs.unlinkSync(tempFile); } catch {}
  }
}

// ─── Parse search results from rendered HTML ───
function parseSearchResults(html) {
  const products = [];
  const text = html.replace(/<[^>]+>/g, "\n");

  const linkRegex = /goods_details\/(\d{10,15})/g;
  const foundIds = [];
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    if (!foundIds.includes(match[1])) foundIds.push(match[1]);
  }

  const productPattern = /([A-Z][^$\n]{10,200}?)\s*\$([\d.]+)\s+([\d,]+)\s*Purchased/g;
  const entries = [];
  let pm;
  while ((pm = productPattern.exec(text)) !== null) {
    entries.push({
      name: pm[1].trim(),
      price: parseFloat(pm[2]),
      sales: parseInt(pm[3].replace(/,/g, ""), 10),
    });
  }

  const imageRegex = /(https:\/\/cdns\.1688order\.com\/uploads\/images\/[^"'\s)]+|https:\/\/cbu01\.alicdn\.com[^"'\s)]+)/g;
  const images = [];
  let im;
  while ((im = imageRegex.exec(html)) !== null) {
    if (!images.includes(im[1]) && !im[1].includes("logo") && !im[1].includes("icon")) {
      images.push(im[1]);
    }
  }

  const limit = Math.min(foundIds.length, entries.length, 12);
  for (let i = 0; i < limit; i++) {
    const entry = entries[i];
    if (entry && entry.name.length > 5) {
      products.push({
        id: foundIds[i],
        name: entry.name.substring(0, 200),
        priceUSD: entry.price,
        priceCNY: Math.round(entry.price * 7.2 * 100) / 100,
        imageUrl: images[i] || "",
        salesVolume: entry.sales,
        detailUrl: `https://1688order.com/pc/goods_details/${foundIds[i]}`,
        supplierRating: null,
        minOrder: 1,
      });
    }
  }

  return products;
}

// ─── HTTP Server ───
const server = http.createServer(async (req, res) => {
  const setCors = () => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");
  };

  if (req.method === "OPTIONS") {
    setCors();
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "GET" && req.url === "/health") {
    setCors();
    res.writeHead(200);
    res.end(JSON.stringify({ status: "ok", uptime: process.uptime() }));
    return;
  }

  if (req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", async () => {
      setCors();
      try {
        const data = JSON.parse(body);

        if (req.url === "/search" && data.keyword) {
          console.log(`[1688] Keyword search: "${data.keyword}"`);
          const products = await searchByKeyword(data.keyword);
          console.log(`[1688] Found ${products.length} products`);
          res.writeHead(200);
          res.end(JSON.stringify({ products }));
        } else if (req.url === "/image" && data.imageBase64) {
          console.log(`[1688] Image search: ${data.imageBase64.length} chars`);
          const products = await searchByImage(data.imageBase64);
          console.log(`[1688] Found ${products.length} products`);
          res.writeHead(200);
          res.end(JSON.stringify({ products }));
        } else {
          res.writeHead(400);
          res.end(JSON.stringify({ error: "Invalid request" }));
        }
      } catch (e) {
        console.error("[1688] Error:", e.message);
        res.writeHead(500);
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, () => {
  console.log(`[1688] Search microservice running on port ${PORT}`);
  console.log(`[1688] Endpoints: POST /search, POST /image, GET /health`);
});
