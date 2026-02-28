import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { prisma } from "./db";

// ── Shared SMTP transport (lazy, DB-aware) ──

let _cachedTransporter: Transporter | null = null;

/**
 * Returns a nodemailer transporter configured from DB settings (Setting table),
 * falling back to process.env, then to defaults.
 * The transporter is cached and reused across calls; call `resetTransporter()`
 * after settings change.
 */
export async function getTransporter(): Promise<Transporter | null> {
  if (_cachedTransporter) return _cachedTransporter;

  let host = process.env.SMTP_HOST || "smtp.gmail.com";
  let port = Number(process.env.SMTP_PORT) || 587;
  let user = process.env.SMTP_USER || "";
  let pass = process.env.SMTP_PASS || "";

  try {
    const dbSettings = await prisma.setting.findMany({
      where: { key: { in: ["smtp_host", "smtp_port", "smtp_user", "smtp_pass"] } },
    });
    for (const s of dbSettings) {
      if (!s.value) continue;
      if (s.key === "smtp_host") host = s.value;
      if (s.key === "smtp_port") port = Number(s.value);
      if (s.key === "smtp_user") user = s.value;
      if (s.key === "smtp_pass") pass = s.value;
    }
  } catch {
    // DB not ready yet (e.g. during tests) – use env only
  }

  if (!pass) return null; // no password → SMTP not configured

  _cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return _cachedTransporter;
}

/** Clear cached transporter (call after SMTP settings change). */
export function resetTransporter(): void {
  _cachedTransporter = null;
}

async function getFromEmail(): Promise<string> {
  try {
    const s = await prisma.setting.findUnique({ where: { key: "smtp_user" } });
    if (s?.value) return s.value;
  } catch { /* use env */ }
  return process.env.SMTP_USER || "noreply@dogeconsulting.com";
}

async function getAdminEmail(): Promise<string> {
  try {
    const s = await prisma.setting.findUnique({ where: { key: "admin_email" } });
    if (s?.value) return s.value;
  } catch { /* use env */ }
  return process.env.CONTACT_RECEIVER_EMAIL || "dogetech77@gmail.com";
}

async function getAppUrl(): Promise<string> {
  try {
    const s = await prisma.setting.findUnique({ where: { key: "app_url" } });
    if (s?.value) return s.value;
  } catch { /* use env */ }
  return process.env.APP_URL || "http://localhost:3000";
}

/** Check whether a notification type is enabled in settings. */
async function isNotificationEnabled(type: "quote" | "payment" | "shipment"): Promise<boolean> {
  try {
    const key = `notify_${type}`;
    const s = await prisma.setting.findUnique({ where: { key } });
    return s ? s.value === "true" : true; // default enabled
  } catch {
    return true;
  }
}

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  type: string;
  orderId?: string;
}

export async function sendEmail({ to, subject, html, type, orderId }: EmailParams): Promise<boolean> {
  try {
    const transporter = await getTransporter();
    if (transporter) {
      const fromEmail = await getFromEmail();
      await transporter.sendMail({
        from: `"Doge Consulting" <${fromEmail}>`,
        to,
        subject,
        html,
      });
    } else {
      console.log(`📧 [${type}] Email to ${to}: ${subject}`);
      console.log(html.replace(/<[^>]*>/g, "").substring(0, 200));
    }

    await prisma.emailLog.create({
      data: { to, subject, type, status: "sent", orderId },
    });
    return true;
  } catch (error) {
    console.error(`Failed to send email [${type}]:`, error);
    await prisma.emailLog.create({
      data: { to, subject, type, status: "failed", orderId, error: String(error) },
    });
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// ── Branded Email Template System ──
// ═══════════════════════════════════════════════════════════════

const COLORS = {
  teal: "#14b8a6",
  navy: "#0f172a",
  gold: "#eab308",
  grayLight: "#f8fafc",
  grayBorder: "#e2e8f0",
  grayText: "#64748b",
  grayMuted: "#94a3b8",
  green: "#22c55e",
  greenBg: "#f0fdf4",
  blue: "#3b82f6",
  blueBg: "#eff6ff",
  amber: "#f59e0b",
  amberBg: "#fffbeb",
  red: "#ef4444",
};

function emailWrapper(content: string, preheader?: string): string {
  const preheaderHtml = preheader
    ? `<div style="display:none;font-size:1px;color:#fff;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>`
    : "";
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
${preheaderHtml}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;">
<tr><td align="center" style="padding:24px 16px;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <!-- Header -->
    <tr><td style="background:linear-gradient(135deg,${COLORS.navy} 0%,#1e293b 100%);padding:28px 32px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">🐕 Doge Consulting Group</h1>
      <p style="margin:6px 0 0;color:${COLORS.teal};font-size:13px;font-weight:500;">Premium Shipping from China to USA</p>
    </td></tr>
    <!-- Content -->
    <tr><td style="padding:32px;">
      ${content}
    </td></tr>
    <!-- Footer -->
    <tr><td style="background:${COLORS.grayLight};padding:24px 32px;border-top:1px solid ${COLORS.grayBorder};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="text-align:center;">
          <p style="margin:0;color:${COLORS.grayMuted};font-size:12px;">Doge Consulting Group Limited &middot; Hong Kong</p>
          <p style="margin:6px 0 0;color:${COLORS.grayMuted};font-size:11px;">This is an automated notification. Please do not reply directly to this email.</p>
          <p style="margin:6px 0 0;color:${COLORS.grayMuted};font-size:11px;">Need help? Contact us at <a href="mailto:dogetech77@gmail.com" style="color:${COLORS.teal};">dogetech77@gmail.com</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</td></tr>
</table>
</body></html>`;
}

/** Styled CTA button */
function ctaButton(text: string, url: string, color: string = COLORS.teal): string {
  return `<div style="text-align:center;margin:24px 0;">
    <a href="${url}" style="display:inline-block;background:${color};color:#ffffff;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;line-height:1;">${text}</a>
  </div>`;
}

/** Status badge pill */
function statusBadge(label: string, color: string, bgColor: string): string {
  return `<span style="display:inline-block;background:${bgColor};color:${color};padding:4px 14px;border-radius:20px;font-size:13px;font-weight:600;">${label}</span>`;
}

/** Info box with left border accent */
function infoBox(content: string, borderColor: string = COLORS.teal, bgColor: string = COLORS.grayLight): string {
  return `<div style="background:${bgColor};border-radius:8px;padding:16px 20px;margin:16px 0;border-left:4px solid ${borderColor};">${content}</div>`;
}

/** Key-value detail row */
function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 0;color:${COLORS.grayText};font-size:14px;width:140px;">${label}</td>
    <td style="padding:6px 0;font-size:14px;font-weight:500;color:${COLORS.navy};">${value}</td>
  </tr>`;
}

/** Items table */
function itemsTable(items: { name: string; quantity: number; totalPrice: number }[], currency: string): string {
  const rows = items.map((item) =>
    `<tr>
      <td style="padding:10px 12px;border-bottom:1px solid ${COLORS.grayBorder};font-size:14px;">${item.name}</td>
      <td style="padding:10px 12px;border-bottom:1px solid ${COLORS.grayBorder};text-align:center;font-size:14px;">${item.quantity}</td>
      <td style="padding:10px 12px;border-bottom:1px solid ${COLORS.grayBorder};text-align:right;font-size:14px;">${formatMoney(item.totalPrice, currency)}</td>
    </tr>`
  ).join("");

  return `<table style="width:100%;border-collapse:collapse;margin:12px 0;" role="presentation">
    <thead><tr style="background:${COLORS.grayLight};">
      <th style="padding:10px 12px;text-align:left;font-size:13px;color:${COLORS.grayText};font-weight:600;text-transform:uppercase;">Item</th>
      <th style="padding:10px 12px;text-align:center;font-size:13px;color:${COLORS.grayText};font-weight:600;text-transform:uppercase;">Qty</th>
      <th style="padding:10px 12px;text-align:right;font-size:13px;color:${COLORS.grayText};font-weight:600;text-transform:uppercase;">Price</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

/** Progress tracker for order status */
function orderProgressTracker(currentStatus: string): string {
  const steps = [
    { key: "confirmed", label: "Confirmed", icon: "📋" },
    { key: "sourcing", label: "Sourcing", icon: "🔍" },
    { key: "packing", label: "Packing", icon: "📦" },
    { key: "in_transit", label: "In Transit", icon: "🚢" },
    { key: "customs", label: "Customs", icon: "🛃" },
    { key: "delivered", label: "Delivered", icon: "✅" },
  ];

  const currentIdx = steps.findIndex((s) => s.key === currentStatus);
  const cells = steps.map((step, i) => {
    const isActive = i === currentIdx;
    const isDone = i < currentIdx;
    const bg = isActive ? COLORS.teal : isDone ? "#d1fae5" : COLORS.grayLight;
    const textColor = isActive ? "#ffffff" : isDone ? "#065f46" : COLORS.grayMuted;
    const dotBg = isActive ? "#ffffff" : isDone ? "#065f46" : "#cbd5e1";
    return `<td style="text-align:center;padding:4px;width:${Math.floor(100 / steps.length)}%;">
      <div style="background:${bg};border-radius:8px;padding:8px 4px;">
        <div style="font-size:16px;">${step.icon}</div>
        <div style="width:8px;height:8px;background:${dotBg};border-radius:50%;margin:4px auto;"></div>
        <div style="font-size:10px;color:${textColor};font-weight:${isActive ? "700" : "500"};">${step.label}</div>
      </div>
    </td>`;
  }).join("");

  return `<table role="presentation" style="width:100%;border-collapse:collapse;margin:16px 0;"><tr>${cells}</tr></table>`;
}

function formatMoney(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

// ═══════════════════════════════════════════════════════════════
// ── Notification Functions ──
// ═══════════════════════════════════════════════════════════════

// ── 1. Quote Request Submitted (public form) ──

export async function sendQuoteRequestedEmail(quote: {
  quoteNumber: string;
  customerName: string;
  customerEmail: string;
  shippingEstimateUSD: number;
  items: { name: string; quantity: number }[];
  deliveryType: string;
  destination: string;
}) {
  const enabled = await isNotificationEnabled("quote");
  if (!enabled) return;

  const appUrl = await getAppUrl();
  const itemList = quote.items.map((i) =>
    `<li style="padding:4px 0;font-size:14px;">${i.name} &times; ${i.quantity}</li>`
  ).join("");

  // Email to customer
  await sendEmail({
    to: quote.customerEmail,
    subject: `Quote Request Received — ${quote.quoteNumber}`,
    type: "quote_requested",
    html: emailWrapper(`
      <h2 style="color:${COLORS.navy};margin:0 0 8px;font-size:20px;">Quote Request Received 📩</h2>
      <p style="color:${COLORS.grayText};margin:0 0 20px;font-size:15px;">Hi ${quote.customerName}, we've received your shipping quote request!</p>

      ${infoBox(`
        <table role="presentation" style="width:100%;" cellpadding="0" cellspacing="0">
          ${detailRow("Quote Number", `<strong>${quote.quoteNumber}</strong>`)}
          ${detailRow("Delivery Type", quote.deliveryType === "Door-to-Door" ? "🚛 Door-to-Door" : "🏭 Warehouse Pickup")}
          ${detailRow("Destination", quote.destination)}
          ${detailRow("Estimated Cost", `<span style="color:${COLORS.teal};font-weight:700;">${formatMoney(quote.shippingEstimateUSD)}</span>`)}
        </table>
      `)}

      <h3 style="color:${COLORS.navy};font-size:15px;margin:20px 0 8px;">Items in your quote:</h3>
      <ul style="margin:0;padding:0 0 0 20px;color:${COLORS.navy};">${itemList}</ul>

      <div style="background:${COLORS.blueBg};border-radius:8px;padding:16px;margin:20px 0;text-align:center;">
        <p style="margin:0;font-size:14px;color:${COLORS.navy};">
          <strong>What happens next?</strong><br/>
          Our team will review your request and send you a detailed quote with final pricing within 1&ndash;2 business days.
        </p>
      </div>

      ${ctaButton("View My Account", `${appUrl}/account`)}

      <p style="color:${COLORS.grayText};font-size:13px;">If you have any questions, feel free to contact us.</p>
    `, `We received your quote request ${quote.quoteNumber}`),
  });

  // Notify admin
  const adminEmail = await getAdminEmail();
  await sendEmail({
    to: adminEmail,
    subject: `[New Quote Request] ${quote.quoteNumber} — ${quote.customerName}`,
    type: "quote_requested",
    html: emailWrapper(`
      <h2 style="color:${COLORS.navy};font-size:18px;">New Quote Request</h2>
      <p style="font-size:14px;color:${COLORS.grayText};">A new quote request has been submitted:</p>
      ${infoBox(`
        <table role="presentation" style="width:100%;" cellpadding="0" cellspacing="0">
          ${detailRow("Quote", quote.quoteNumber)}
          ${detailRow("Customer", `${quote.customerName} (${quote.customerEmail})`)}
          ${detailRow("Delivery", quote.deliveryType)}
          ${detailRow("Destination", quote.destination)}
          ${detailRow("Estimate", formatMoney(quote.shippingEstimateUSD))}
          ${detailRow("Items", String(quote.items.length))}
        </table>
      `)}
      ${ctaButton("Review in Admin", `${appUrl}/admin/quotes`)}
    `),
  });
}

// ── 2. Quote Sent to Customer (admin sends finalized quote) ──

export async function sendQuoteSentEmail(quote: {
  quoteNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  currency: string;
  items: { name: string; quantity: number; totalPrice: number }[];
  paymentLinkUrl?: string;
}) {
  const enabled = await isNotificationEnabled("quote");
  if (!enabled) return;

  const depositAmount = quote.totalAmount * 0.7;
  const paymentSection = quote.paymentLinkUrl
    ? `<div style="background:${COLORS.greenBg};border-radius:8px;padding:20px;margin:20px 0;text-align:center;border:1px solid #bbf7d0;">
        <p style="margin:0 0 8px;font-size:14px;color:${COLORS.navy};">To proceed, pay the 70% deposit:</p>
        <p style="margin:0 0 16px;font-size:28px;font-weight:700;color:${COLORS.teal};">${formatMoney(depositAmount, quote.currency)}</p>
        <a href="${quote.paymentLinkUrl}" style="display:inline-block;background:${COLORS.teal};color:#ffffff;padding:14px 40px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">💳 Pay Deposit Now</a>
        <p style="margin:12px 0 0;font-size:12px;color:${COLORS.grayText};">Secure payment via Airwallex &middot; Credit Card, Debit, ACH, Wire</p>
      </div>`
    : "";

  await sendEmail({
    to: quote.customerEmail,
    subject: `Your Quote ${quote.quoteNumber} is Ready — Doge Consulting`,
    type: "quote_sent",
    html: emailWrapper(`
      <h2 style="color:${COLORS.navy};margin:0 0 8px;font-size:20px;">Your Quote is Ready! 📋</h2>
      <p style="color:${COLORS.grayText};margin:0 0 20px;font-size:15px;">Hi ${quote.customerName}, here's your finalized shipping quote:</p>

      ${infoBox(`<p style="margin:0;font-size:14px;"><strong>Quote Number:</strong> ${quote.quoteNumber}</p>`)}

      ${itemsTable(quote.items, quote.currency)}

      <table role="presentation" style="width:100%;margin:16px 0;">
        <tr>
          <td style="text-align:right;padding:8px 12px;font-size:16px;font-weight:700;color:${COLORS.navy};">Total:</td>
          <td style="text-align:right;padding:8px 12px;font-size:20px;font-weight:700;color:${COLORS.teal};width:140px;">${formatMoney(quote.totalAmount, quote.currency)}</td>
        </tr>
      </table>

      ${paymentSection}

      <p style="color:${COLORS.grayText};font-size:13px;">This quote is valid for 30 days. If you have questions, reply to this email or contact us.</p>
    `, `Your quote ${quote.quoteNumber} is ready — Total: ${formatMoney(quote.totalAmount, quote.currency)}`),
  });

  // Notify admin
  const adminEmail = await getAdminEmail();
  await sendEmail({
    to: adminEmail,
    subject: `[Admin] Quote ${quote.quoteNumber} sent to ${quote.customerName}`,
    type: "quote_sent",
    html: emailWrapper(`
      <h2 style="color:${COLORS.navy};font-size:18px;">Quote Sent</h2>
      ${infoBox(`
        <table role="presentation" style="width:100%;" cellpadding="0" cellspacing="0">
          ${detailRow("Quote", quote.quoteNumber)}
          ${detailRow("Customer", `${quote.customerName} (${quote.customerEmail})`)}
          ${detailRow("Total", formatMoney(quote.totalAmount, quote.currency))}
        </table>
      `)}
    `),
  });
}

// ── 3. Payment Link Sent (payment awaiting) ──

export async function sendPaymentLinkEmail(params: {
  customerName: string;
  customerEmail: string;
  quoteNumber: string;
  amount: number;
  currency: string;
  paymentUrl: string;
  description: string;
}) {
  const enabled = await isNotificationEnabled("payment");
  if (!enabled) return;

  await sendEmail({
    to: params.customerEmail,
    subject: `Payment Required — ${params.quoteNumber} — Doge Consulting`,
    type: "payment_link",
    html: emailWrapper(`
      <h2 style="color:${COLORS.navy};margin:0 0 8px;font-size:20px;">Payment Required 💳</h2>
      <p style="color:${COLORS.grayText};margin:0 0 20px;font-size:15px;">Hi ${params.customerName}, please complete your payment to proceed with your order.</p>

      <div style="background:${COLORS.grayLight};border-radius:12px;padding:24px;margin:20px 0;text-align:center;border:1px solid ${COLORS.grayBorder};">
        <p style="margin:0 0 4px;font-size:13px;color:${COLORS.grayText};text-transform:uppercase;letter-spacing:1px;">Amount Due</p>
        <p style="margin:0 0 8px;font-size:36px;font-weight:700;color:${COLORS.teal};">${formatMoney(params.amount, params.currency)}</p>
        <p style="margin:0 0 20px;font-size:14px;color:${COLORS.grayText};">${params.description}</p>
        <a href="${params.paymentUrl}" style="display:inline-block;background:${COLORS.teal};color:#ffffff;padding:16px 48px;border-radius:8px;text-decoration:none;font-weight:700;font-size:17px;">Pay Now &rarr;</a>
      </div>

      <div style="text-align:center;margin:16px 0;">
        <p style="color:${COLORS.grayText};font-size:12px;">🔒 Secured by Airwallex &middot; 256-bit SSL encryption</p>
        <p style="color:${COLORS.grayText};font-size:12px;">Accepted: Visa &middot; Mastercard &middot; Amex &middot; UnionPay &middot; ACH &middot; Wire</p>
      </div>

      <p style="color:${COLORS.grayText};font-size:13px;">If you have trouble with the button above, copy and paste this link:<br/><a href="${params.paymentUrl}" style="color:${COLORS.teal};word-break:break-all;">${params.paymentUrl}</a></p>
    `, `Payment of ${formatMoney(params.amount, params.currency)} required for ${params.quoteNumber}`),
  });
}

// ── 4. Payment Received ──

export async function sendPaymentReceivedEmail(payment: {
  paymentNumber: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  method: string;
  type: string;
}) {
  const enabled = await isNotificationEnabled("payment");
  if (!enabled) return;

  const appUrl = await getAppUrl();

  await sendEmail({
    to: payment.customerEmail,
    subject: `Payment Confirmed — ${payment.paymentNumber} — Doge Consulting`,
    type: "payment_received",
    orderId: payment.orderNumber,
    html: emailWrapper(`
      <h2 style="color:${COLORS.navy};margin:0 0 8px;font-size:20px;">Payment Confirmed ✅</h2>
      <p style="color:${COLORS.grayText};margin:0 0 20px;font-size:15px;">Hi ${payment.customerName}, we've successfully received your payment!</p>

      ${infoBox(`
        <table role="presentation" style="width:100%;" cellpadding="0" cellspacing="0">
          ${detailRow("Payment #", `<strong>${payment.paymentNumber}</strong>`)}
          ${detailRow("Order #", payment.orderNumber)}
          ${detailRow("Amount", `<span style="color:${COLORS.green};font-weight:700;">${formatMoney(payment.amount, payment.currency)}</span>`)}
          ${detailRow("Method", payment.method.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))}
          ${detailRow("Type", payment.type.replace(/\b\w/g, (c) => c.toUpperCase()))}
          ${detailRow("Status", statusBadge("Confirmed", "#065f46", "#d1fae5"))}
        </table>
      `, COLORS.green, COLORS.greenBg)}

      <p style="font-size:14px;color:${COLORS.navy};">A receipt has been generated and is available in your account.</p>

      ${ctaButton("View My Orders", `${appUrl}/account/orders`)}
    `, `Payment of ${formatMoney(payment.amount, payment.currency)} confirmed for order ${payment.orderNumber}`),
  });

  // Notify admin
  const adminEmail = await getAdminEmail();
  await sendEmail({
    to: adminEmail,
    subject: `[Admin] Payment ${payment.paymentNumber} — ${formatMoney(payment.amount, payment.currency)}`,
    type: "payment_received",
    orderId: payment.orderNumber,
    html: emailWrapper(`
      <h2 style="color:${COLORS.navy};font-size:18px;">Payment Received</h2>
      ${infoBox(`
        <table role="presentation" style="width:100%;" cellpadding="0" cellspacing="0">
          ${detailRow("Payment", payment.paymentNumber)}
          ${detailRow("Order", payment.orderNumber)}
          ${detailRow("Customer", `${payment.customerName} (${payment.customerEmail})`)}
          ${detailRow("Amount", formatMoney(payment.amount, payment.currency))}
          ${detailRow("Method", payment.method)}
          ${detailRow("Type", payment.type)}
        </table>
      `, COLORS.green, COLORS.greenBg)}
    `),
  });
}

// ── 5. Order Confirmed (quote converted to order) ──

export async function sendOrderConfirmedEmail(order: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  depositAmount: number;
  currency: string;
}) {
  const appUrl = await getAppUrl();

  await sendEmail({
    to: order.customerEmail,
    subject: `Order Confirmed — ${order.orderNumber} — Doge Consulting`,
    type: "order_confirmed",
    orderId: order.orderNumber,
    html: emailWrapper(`
      <h2 style="color:${COLORS.navy};margin:0 0 8px;font-size:20px;">Order Confirmed! 🎉</h2>
      <p style="color:${COLORS.grayText};margin:0 0 20px;font-size:15px;">Hi ${order.customerName}, great news! Your order has been confirmed and is now being processed.</p>

      ${infoBox(`
        <table role="presentation" style="width:100%;" cellpadding="0" cellspacing="0">
          ${detailRow("Order Number", `<strong>${order.orderNumber}</strong>`)}
          ${detailRow("Order Total", formatMoney(order.totalAmount, order.currency))}
          ${detailRow("Deposit Paid", `<span style="color:${COLORS.green};">${formatMoney(order.depositAmount, order.currency)}</span>`)}
          ${detailRow("Balance Due", `<span style="color:${COLORS.amber};">${formatMoney(order.totalAmount - order.depositAmount, order.currency)}</span>`)}
        </table>
      `, COLORS.green, COLORS.greenBg)}

      ${orderProgressTracker("confirmed")}

      <div style="background:${COLORS.blueBg};border-radius:8px;padding:16px;margin:16px 0;">
        <p style="margin:0;font-size:14px;color:${COLORS.navy};"><strong>What's next?</strong></p>
        <ul style="margin:8px 0 0;padding:0 0 0 20px;color:${COLORS.grayText};font-size:14px;">
          <li>Our team will begin sourcing your products from verified suppliers</li>
          <li>You'll receive email updates at every milestone</li>
          <li>Track your order anytime from your account dashboard</li>
        </ul>
      </div>

      ${ctaButton("Track My Order", `${appUrl}/account/orders`)}
    `, `Your order ${order.orderNumber} has been confirmed!`),
  });

  // Notify admin
  const adminEmail = await getAdminEmail();
  await sendEmail({
    to: adminEmail,
    subject: `[Admin] New Order ${order.orderNumber} — ${formatMoney(order.totalAmount, order.currency)}`,
    type: "order_confirmed",
    orderId: order.orderNumber,
    html: emailWrapper(`
      <h2 style="color:${COLORS.navy};font-size:18px;">New Order Confirmed</h2>
      ${infoBox(`
        <table role="presentation" style="width:100%;" cellpadding="0" cellspacing="0">
          ${detailRow("Order", order.orderNumber)}
          ${detailRow("Customer", `${order.customerName} (${order.customerEmail})`)}
          ${detailRow("Total", formatMoney(order.totalAmount, order.currency))}
          ${detailRow("Deposit", formatMoney(order.depositAmount, order.currency))}
          ${detailRow("Balance", formatMoney(order.totalAmount - order.depositAmount, order.currency))}
        </table>
      `, COLORS.green, COLORS.greenBg)}
    `),
  });
}

// ── 6. Order Status Updates ──

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending Review",
  confirmed: "Order Confirmed",
  sourcing: "Sourcing Products",
  packing: "Packing & Preparing",
  in_transit: "In Transit",
  customs: "Customs Clearance",
  delivered: "Delivered",
  closed: "Order Completed",
  cancelled: "Order Cancelled",
};

const STATUS_ICONS: Record<string, string> = {
  pending: "⏳",
  confirmed: "📋",
  sourcing: "🔍",
  packing: "📦",
  in_transit: "🚢",
  customs: "🛃",
  delivered: "✅",
  closed: "🎉",
  cancelled: "❌",
};

const STATUS_MESSAGES: Record<string, string> = {
  pending: "Your order is pending review by our team.",
  confirmed: "Your order has been confirmed and we're getting started!",
  sourcing: "We're actively sourcing your products from our network of verified Chinese suppliers.",
  packing: "Your products have been received and are being carefully packed and prepared for shipping.",
  in_transit: "Your shipment is on its way! It's currently in transit from China to the USA.",
  customs: "Your shipment has arrived and is currently going through customs clearance.",
  delivered: "Great news! Your shipment has been delivered. Please inspect your goods.",
  closed: "Your order is complete. Thank you for choosing Doge Consulting!",
  cancelled: "Your order has been cancelled. If you have questions, please contact us.",
};

export async function sendOrderStatusEmail(order: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: string;
  trackingId?: string | null;
  vessel?: string | null;
  estimatedDelivery?: string | null;
  note?: string | null;
}) {
  const enabled = await isNotificationEnabled("shipment");
  if (!enabled) return;

  const appUrl = await getAppUrl();
  const label = STATUS_LABELS[order.status] || order.status;
  const icon = STATUS_ICONS[order.status] || "📬";
  const message = STATUS_MESSAGES[order.status] || `Your order status has been updated to: ${label}`;

  // Build details section
  const detailRows: string[] = [];
  detailRows.push(detailRow("Order Number", `<strong>${order.orderNumber}</strong>`));
  detailRows.push(detailRow("Status", statusBadge(`${icon} ${label}`, COLORS.navy, COLORS.grayLight)));
  if (order.trackingId) detailRows.push(detailRow("Tracking ID", order.trackingId));
  if (order.vessel) detailRows.push(detailRow("Vessel", order.vessel));
  if (order.estimatedDelivery) {
    const estDate = new Date(order.estimatedDelivery).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    detailRows.push(detailRow("Est. Delivery", estDate));
  }

  const noteSection = order.note
    ? `<div style="background:${COLORS.amberBg};border-radius:8px;padding:12px 16px;margin:16px 0;border-left:4px solid ${COLORS.amber};">
        <p style="margin:0;font-size:13px;color:${COLORS.grayText};font-weight:600;">Note from our team:</p>
        <p style="margin:4px 0 0;font-size:14px;color:${COLORS.navy};font-style:italic;">${order.note}</p>
      </div>`
    : "";

  // Show progress tracker for trackable statuses
  const showTracker = ["confirmed", "sourcing", "packing", "in_transit", "customs", "delivered"].includes(order.status);

  await sendEmail({
    to: order.customerEmail,
    subject: `${icon} ${label} — Order ${order.orderNumber} — Doge Consulting`,
    type: "order_status",
    orderId: order.orderNumber,
    html: emailWrapper(`
      <h2 style="color:${COLORS.navy};margin:0 0 8px;font-size:20px;">${icon} Order Status Update</h2>
      <p style="color:${COLORS.grayText};margin:0 0 20px;font-size:15px;">Hi ${order.customerName},</p>

      <p style="font-size:15px;color:${COLORS.navy};line-height:1.6;">${message}</p>

      ${showTracker ? orderProgressTracker(order.status) : ""}

      ${infoBox(`
        <table role="presentation" style="width:100%;" cellpadding="0" cellspacing="0">
          ${detailRows.join("")}
        </table>
      `)}

      ${noteSection}

      ${ctaButton("View Order Details", `${appUrl}/account/orders`)}

      ${order.trackingId ? `<p style="text-align:center;font-size:13px;color:${COLORS.grayText};">You can also track your shipment at <a href="${appUrl}/track" style="color:${COLORS.teal};">dogeconsulting.com/track</a></p>` : ""}
    `, `${icon} Your order ${order.orderNumber} status: ${label}`),
  });

  // Notify admin
  const adminEmail = await getAdminEmail();
  await sendEmail({
    to: adminEmail,
    subject: `[Admin] Order ${order.orderNumber} → ${label}`,
    type: "order_status",
    orderId: order.orderNumber,
    html: emailWrapper(`
      <h2 style="color:${COLORS.navy};font-size:18px;">Order Status Changed</h2>
      ${infoBox(`
        <table role="presentation" style="width:100%;" cellpadding="0" cellspacing="0">
          ${detailRow("Order", order.orderNumber)}
          ${detailRow("Customer", `${order.customerName} (${order.customerEmail})`)}
          ${detailRow("New Status", `${icon} ${label}`)}
          ${order.trackingId ? detailRow("Tracking", order.trackingId) : ""}
          ${order.vessel ? detailRow("Vessel", order.vessel) : ""}
        </table>
      `)}
      ${noteSection}
    `),
  });
}

// ── 7. Order Closed / Delivered ──

export async function sendOrderClosedEmail(order: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  currency: string;
}) {
  const appUrl = await getAppUrl();

  await sendEmail({
    to: order.customerEmail,
    subject: `🎉 Order Complete — ${order.orderNumber} — Doge Consulting`,
    type: "order_closed",
    orderId: order.orderNumber,
    html: emailWrapper(`
      <h2 style="color:${COLORS.navy};margin:0 0 8px;font-size:20px;">Order Complete! 🎊</h2>
      <p style="color:${COLORS.grayText};margin:0 0 20px;font-size:15px;">Hi ${order.customerName},</p>

      <p style="font-size:15px;color:${COLORS.navy};line-height:1.6;">Your order <strong>${order.orderNumber}</strong> has been delivered and is now complete. Thank you for choosing Doge Consulting!</p>

      ${orderProgressTracker("delivered")}

      ${infoBox(`
        <table role="presentation" style="width:100%;" cellpadding="0" cellspacing="0">
          ${detailRow("Order Number", order.orderNumber)}
          ${detailRow("Total Amount", formatMoney(order.totalAmount, order.currency))}
          ${detailRow("Status", statusBadge("✅ Complete", "#065f46", "#d1fae5"))}
        </table>
      `, COLORS.green, COLORS.greenBg)}

      <div style="background:${COLORS.grayLight};border-radius:8px;padding:16px;margin:16px 0;text-align:center;">
        <p style="margin:0 0 8px;font-size:15px;color:${COLORS.navy};font-weight:600;">How was your experience?</p>
        <p style="margin:0;font-size:14px;color:${COLORS.grayText};">We'd love to hear from you! Please contact us if you have any feedback.</p>
      </div>

      ${ctaButton("View My Orders", `${appUrl}/account/orders`)}

      <p style="color:${COLORS.grayText};font-size:13px;">If you have any issues with your delivery, please contact us within 30 days.</p>
    `, `Your order ${order.orderNumber} is complete! Thank you for choosing Doge Consulting.`),
  });
}
