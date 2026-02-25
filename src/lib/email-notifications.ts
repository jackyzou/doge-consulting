import nodemailer from "nodemailer";
import { prisma } from "./db";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM_EMAIL = process.env.SMTP_USER || "noreply@dogeconsulting.com";
const ADMIN_EMAIL = process.env.CONTACT_RECEIVER_EMAIL || "dogetech77@gmail.com";

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  type: string;
  orderId?: string;
}

async function sendEmail({ to, subject, html, type, orderId }: EmailParams): Promise<boolean> {
  try {
    if (process.env.SMTP_PASS) {
      await transporter.sendMail({
        from: `"Doge Consulting" <${FROM_EMAIL}>`,
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

// ── Template helpers ──

function emailWrapper(content: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #14b8a6;">
        <h2 style="color: #0f172a; margin: 0;">🐕 Doge Consulting Group</h2>
        <p style="color: #64748b; font-size: 12px; margin: 4px 0 0;">Premium Shipping from China to USA</p>
      </div>
      <div style="padding: 24px 0;">
        ${content}
      </div>
      <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; color: #94a3b8; font-size: 12px;">
        <p>Doge Consulting Group Limited · Hong Kong</p>
        <p>This is an automated message. Please do not reply directly.</p>
      </div>
    </div>
  `;
}

function formatMoney(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

// ── Notification Functions ──

export async function sendQuoteSentEmail(quote: {
  quoteNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  currency: string;
  items: { name: string; quantity: number; totalPrice: number }[];
  paymentLinkUrl?: string;
}) {
  const itemRows = quote.items.map((item) =>
    `<tr><td style="padding:8px;border-bottom:1px solid #f1f5f9;">${item.name}</td>
     <td style="padding:8px;border-bottom:1px solid #f1f5f9;text-align:center;">${item.quantity}</td>
     <td style="padding:8px;border-bottom:1px solid #f1f5f9;text-align:right;">${formatMoney(item.totalPrice, quote.currency)}</td></tr>`
  ).join("");

  const paymentSection = quote.paymentLinkUrl
    ? `<div style="text-align:center;margin:24px 0;">
         <a href="${quote.paymentLinkUrl}" style="display:inline-block;background:#14b8a6;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;">
           Pay Now — ${formatMoney(quote.totalAmount * 0.7, quote.currency)} deposit
         </a>
       </div>`
    : "";

  await sendEmail({
    to: quote.customerEmail,
    subject: `Your Quote ${quote.quoteNumber} — Doge Consulting`,
    type: "quote_sent",
    html: emailWrapper(`
      <h3 style="color:#0f172a;">Hello ${quote.customerName},</h3>
      <p>Thank you for your interest! Here is your shipping quote:</p>
      <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="font-weight:600;color:#0f172a;">Quote ${quote.quoteNumber}</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead><tr style="background:#e2e8f0;">
            <th style="padding:8px;text-align:left;">Item</th>
            <th style="padding:8px;text-align:center;">Qty</th>
            <th style="padding:8px;text-align:right;">Price</th>
          </tr></thead>
          <tbody>${itemRows}</tbody>
          <tfoot><tr style="font-weight:700;">
            <td colspan="2" style="padding:8px;">Total</td>
            <td style="padding:8px;text-align:right;">${formatMoney(quote.totalAmount, quote.currency)}</td>
          </tr></tfoot>
        </table>
      </div>
      ${paymentSection}
      <p style="color:#64748b;font-size:13px;">This quote is valid for 30 days. If you have questions, reply to this email or contact us.</p>
    `),
  });

  // Notify admin
  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `[Admin] Quote ${quote.quoteNumber} sent to ${quote.customerName}`,
    type: "quote_sent",
    html: emailWrapper(`
      <h3>Quote Sent</h3>
      <p><strong>${quote.quoteNumber}</strong> sent to ${quote.customerName} (${quote.customerEmail})</p>
      <p>Total: ${formatMoney(quote.totalAmount, quote.currency)}</p>
    `),
  });
}

export async function sendOrderConfirmedEmail(order: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  depositAmount: number;
  currency: string;
}) {
  await sendEmail({
    to: order.customerEmail,
    subject: `Order Confirmed — ${order.orderNumber}`,
    type: "order_confirmed",
    orderId: order.orderNumber,
    html: emailWrapper(`
      <h3 style="color:#0f172a;">Order Confirmed! 🎉</h3>
      <p>Hello ${order.customerName},</p>
      <p>Your order <strong>${order.orderNumber}</strong> has been confirmed and is now being processed.</p>
      <div style="background:#f0fdf4;border-radius:8px;padding:16px;margin:16px 0;border-left:4px solid #22c55e;">
        <p style="margin:0;"><strong>Order Total:</strong> ${formatMoney(order.totalAmount, order.currency)}</p>
        <p style="margin:4px 0 0;"><strong>Deposit Paid:</strong> ${formatMoney(order.depositAmount, order.currency)}</p>
        <p style="margin:4px 0 0;"><strong>Balance Due:</strong> ${formatMoney(order.totalAmount - order.depositAmount, order.currency)}</p>
      </div>
      <p>Our team will begin sourcing your products. You'll receive updates at each milestone.</p>
    `),
  });

  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `[Admin] New Order ${order.orderNumber} — ${formatMoney(order.totalAmount, order.currency)}`,
    type: "order_confirmed",
    orderId: order.orderNumber,
    html: emailWrapper(`
      <h3>New Order Received</h3>
      <p><strong>${order.orderNumber}</strong> from ${order.customerName}</p>
      <p>Total: ${formatMoney(order.totalAmount, order.currency)} | Deposit: ${formatMoney(order.depositAmount, order.currency)}</p>
    `),
  });
}

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
  await sendEmail({
    to: payment.customerEmail,
    subject: `Payment Received — ${payment.paymentNumber}`,
    type: "payment_received",
    orderId: payment.orderNumber,
    html: emailWrapper(`
      <h3 style="color:#0f172a;">Payment Received ✅</h3>
      <p>Hello ${payment.customerName},</p>
      <p>We've received your payment:</p>
      <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:16px 0;">
        <p><strong>Payment:</strong> ${payment.paymentNumber}</p>
        <p><strong>Order:</strong> ${payment.orderNumber}</p>
        <p><strong>Amount:</strong> ${formatMoney(payment.amount, payment.currency)}</p>
        <p><strong>Method:</strong> ${payment.method.replace("_", " ")}</p>
        <p><strong>Type:</strong> ${payment.type}</p>
      </div>
      <p>A receipt has been generated and is available in your account.</p>
    `),
  });

  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `[Admin] Payment ${payment.paymentNumber} received — ${formatMoney(payment.amount, payment.currency)}`,
    type: "payment_received",
    orderId: payment.orderNumber,
    html: emailWrapper(`
      <h3>Payment Received</h3>
      <p>${payment.paymentNumber} for order ${payment.orderNumber}</p>
      <p>${formatMoney(payment.amount, payment.currency)} via ${payment.method}</p>
    `),
  });
}

export async function sendOrderClosedEmail(order: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  currency: string;
}) {
  await sendEmail({
    to: order.customerEmail,
    subject: `Order Complete — ${order.orderNumber}`,
    type: "order_closed",
    orderId: order.orderNumber,
    html: emailWrapper(`
      <h3 style="color:#0f172a;">Order Complete! 🎊</h3>
      <p>Hello ${order.customerName},</p>
      <p>Your order <strong>${order.orderNumber}</strong> has been delivered and closed.</p>
      <p>Thank you for choosing Doge Consulting! We hope you love your products.</p>
      <p style="color:#64748b;font-size:13px;">If you have any issues, please contact us within 30 days.</p>
    `),
  });
}

export async function sendPaymentLinkEmail(params: {
  customerName: string;
  customerEmail: string;
  quoteNumber: string;
  amount: number;
  currency: string;
  paymentUrl: string;
  description: string;
}) {
  await sendEmail({
    to: params.customerEmail,
    subject: `Payment Link — ${params.quoteNumber}`,
    type: "payment_link",
    html: emailWrapper(`
      <h3 style="color:#0f172a;">Hello ${params.customerName},</h3>
      <p>Please use the link below to complete your payment for <strong>${params.quoteNumber}</strong>:</p>
      <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:16px 0;text-align:center;">
        <p style="font-size:24px;font-weight:700;color:#0f172a;margin:0;">${formatMoney(params.amount, params.currency)}</p>
        <p style="color:#64748b;margin:4px 0 12px;">${params.description}</p>
        <a href="${params.paymentUrl}" style="display:inline-block;background:#14b8a6;color:white;padding:14px 40px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">
          Pay Now
        </a>
      </div>
      <p style="color:#64748b;font-size:13px;">This payment link accepts credit cards, debit cards, ACH, and wire transfers.</p>
    `),
  });
}
