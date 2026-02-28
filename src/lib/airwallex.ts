// Airwallex payment integration utilities
// Reference: https://www.airwallex.com/docs/api

import crypto from "crypto";

export interface PaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: "INITIAL" | "REQUIRES_PAYMENT_METHOD" | "REQUIRES_CUSTOMER_ACTION" | "REQUIRES_CAPTURE" | "SUCCEEDED" | "CANCELLED" | "PENDING";
  orderId: string;
  customerEmail: string;
  description: string;
  createdAt: string;
}

export interface CreatePaymentRequest {
  amount: number;
  currency: string;
  orderId: string;
  customerEmail: string;
  customerName: string;
  description: string;
  returnUrl: string;
  metadata?: Record<string, string>;
}

// ── Configuration ──────────────────────────────────────────────────
const AIRWALLEX_API_URL = process.env.NEXT_PUBLIC_AIRWALLEX_ENV === "production"
  ? "https://api.airwallex.com"
  : "https://api-demo.airwallex.com";

const AIRWALLEX_CLIENT_ID = process.env.AIRWALLEX_CLIENT_ID || "";
const AIRWALLEX_API_KEY = process.env.AIRWALLEX_API_KEY || "";

/** Returns true when real credentials are configured */
export function isLiveMode(): boolean {
  return !!(process.env.AIRWALLEX_CLIENT_ID && process.env.AIRWALLEX_API_KEY);
}

// ── Auth token cache ───────────────────────────────────────────────
// Airwallex tokens are valid for ~30 minutes; we cache and refresh at 25 min
let cachedToken: string | null = null;
let tokenExpiresAt = 0;

/**
 * Get Airwallex API authentication token
 * POST /api/v1/authentication/login
 */
export async function getAuthToken(): Promise<string> {
  if (!isLiveMode()) {
    console.warn("⚠️ Airwallex API key not configured. Using demo mode.");
    return "demo_token";
  }

  // Return cached token if still fresh (25 min window)
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const response = await fetch(`${AIRWALLEX_API_URL}/api/v1/authentication/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": AIRWALLEX_CLIENT_ID,
      "x-api-key": AIRWALLEX_API_KEY,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(`Airwallex auth failed (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  cachedToken = data.token;
  tokenExpiresAt = Date.now() + 25 * 60 * 1000; // refresh 5 min before expiry
  return data.token;
}

/**
 * Build the Airwallex Hosted Payment Page URL for a given intent
 */
export function buildCheckoutUrl(intentId: string, clientSecret: string, currency: string): string {
  const env = process.env.NEXT_PUBLIC_AIRWALLEX_ENV === "production" ? "checkout" : "checkout-demo";
  return `https://${env}.airwallex.com/#/standalone/checkout`
    + `?intent_id=${intentId}`
    + `&client_secret=${encodeURIComponent(clientSecret)}`
    + `&currency=${currency}`
    + `&mode=payment`;
}

/**
 * Create a Payment Intent via Airwallex API
 * POST /api/v1/pa/payment_intents/create
 */
export async function createPaymentIntent(
  request: CreatePaymentRequest
): Promise<PaymentIntent> {
  // Demo mode — return a simulated payment intent
  if (!isLiveMode()) {
    const demoId = `demo_pi_${Date.now()}`;
    return {
      id: demoId,
      client_secret: `demo_cs_${demoId}`,
      amount: request.amount,
      currency: request.currency,
      status: "REQUIRES_PAYMENT_METHOD",
      orderId: request.orderId,
      customerEmail: request.customerEmail,
      description: request.description,
      createdAt: new Date().toISOString(),
    };
  }

  const token = await getAuthToken();
  const requestId = `req_${crypto.randomUUID()}`;

  const response = await fetch(
    `${AIRWALLEX_API_URL}/api/v1/pa/payment_intents/create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount: request.amount,
        currency: request.currency,
        merchant_order_id: request.orderId,
        descriptor: request.description?.substring(0, 32) || "Doge Consulting",
        metadata: {
          customerEmail: request.customerEmail,
          customerName: request.customerName,
          orderId: request.orderId,
          ...(request.metadata || {}),
        },
        return_url: request.returnUrl,
        request_id: requestId,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Airwallex createPaymentIntent error:", errorData);
    throw new Error(
      `Failed to create payment intent: ${response.status} ${JSON.stringify(errorData)}`
    );
  }

  const data = await response.json();

  return {
    id: data.id,
    client_secret: data.client_secret,
    amount: data.amount,
    currency: data.currency,
    status: data.status,
    orderId: request.orderId,
    customerEmail: request.customerEmail,
    description: request.description,
    createdAt: data.created_at,
  };
}

/**
 * Retrieve a Payment Intent by ID (for verifying status on return)
 */
export async function getPaymentIntent(intentId: string): Promise<PaymentIntent | null> {
  if (!isLiveMode()) return null;

  const token = await getAuthToken();
  const response = await fetch(
    `${AIRWALLEX_API_URL}/api/v1/pa/payment_intents/${intentId}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) return null;

  const data = await response.json();
  return {
    id: data.id,
    client_secret: data.client_secret,
    amount: data.amount,
    currency: data.currency,
    status: data.status,
    orderId: data.merchant_order_id || data.metadata?.orderId || "",
    customerEmail: data.metadata?.customerEmail || "",
    description: data.descriptor || "",
    createdAt: data.created_at,
  };
}

/**
 * Verify webhook signature from Airwallex using HMAC-SHA256
 * Airwallex signs: `${timestamp}${body}` with the webhook secret
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  timestamp: string,
  secret: string
): boolean {
  if (!secret) {
    console.warn("⚠️ No webhook secret configured — skipping signature verification");
    return true;
  }

  try {
    const signedPayload = `${timestamp}${payload}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(signedPayload)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch (error) {
    console.error("Webhook signature verification error:", error);
    return false;
  }
}

/**
 * Format currency amount for display
 */
export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
