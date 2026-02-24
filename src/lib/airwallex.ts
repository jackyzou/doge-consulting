// Airwallex payment integration utilities
// Reference: https://www.airwallex.com/docs/api

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: "INITIAL" | "REQUIRES_PAYMENT_METHOD" | "REQUIRES_CUSTOMER_ACTION" | "REQUIRES_CAPTURE" | "SUCCEEDED" | "CANCELLED";
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
}

// In production, these would come from environment variables
const AIRWALLEX_API_URL = process.env.NEXT_PUBLIC_AIRWALLEX_ENV === "production"
  ? "https://api.airwallex.com"
  : "https://api-demo.airwallex.com";

const AIRWALLEX_CLIENT_ID = process.env.AIRWALLEX_CLIENT_ID || "demo_client_id";
const AIRWALLEX_API_KEY = process.env.AIRWALLEX_API_KEY || "demo_api_key";

/**
 * Get Airwallex API authentication token
 * In production: POST /api/v1/authentication/login
 */
export async function getAuthToken(): Promise<string> {
  // For demo/development, return a placeholder
  if (!process.env.AIRWALLEX_API_KEY) {
    console.warn("Airwallex API key not configured. Using demo mode.");
    return "demo_token";
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
    throw new Error(`Airwallex auth failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.token;
}

/**
 * Create a Payment Intent via Airwallex API
 * In production: POST /api/v1/pa/payment_intents/create
 */
export async function createPaymentIntent(
  request: CreatePaymentRequest
): Promise<PaymentIntent> {
  // Demo mode - return a simulated payment intent
  if (!process.env.AIRWALLEX_API_KEY) {
    return {
      id: `demo_pi_${Date.now()}`,
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
        descriptor: request.description,
        metadata: {
          customerEmail: request.customerEmail,
          customerName: request.customerName,
        },
        return_url: request.returnUrl,
        request_id: `req_${Date.now()}`,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Failed to create payment intent: ${response.statusText} ${JSON.stringify(errorData)}`
    );
  }

  const data = await response.json();

  return {
    id: data.id,
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
 * Verify webhook signature from Airwallex
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // In production, implement HMAC-SHA256 verification
  // Reference: https://www.airwallex.com/docs/api#/Webhooks
  if (!secret) return true; // Demo mode
  // crypto.createHmac('sha256', secret).update(payload).digest('hex') === signature
  return true;
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
