/**
 * Airwallex Connectivity Test Script
 * Run: npx tsx scripts/test-airwallex.ts
 *
 * Tests:
 * 1. Authentication (get bearer token)
 * 2. Create a $1 test payment intent
 * 3. Print the checkout URL
 */

import "dotenv/config";

const API_URL = process.env.NEXT_PUBLIC_AIRWALLEX_ENV === "production"
  ? "https://api.airwallex.com"
  : "https://api-demo.airwallex.com";

const CLIENT_ID = process.env.AIRWALLEX_CLIENT_ID;
const API_KEY = process.env.AIRWALLEX_API_KEY;

async function main() {
  console.log("\n🐕 Airwallex Connectivity Test\n");
  console.log(`API URL:   ${API_URL}`);
  console.log(`Client ID: ${CLIENT_ID ? CLIENT_ID.substring(0, 8) + "..." : "❌ NOT SET"}`);
  console.log(`API Key:   ${API_KEY ? API_KEY.substring(0, 8) + "..." : "❌ NOT SET"}`);
  console.log();

  if (!CLIENT_ID || !API_KEY) {
    console.error("❌ AIRWALLEX_CLIENT_ID and AIRWALLEX_API_KEY must be set in .env.local");
    console.log("\nTo set up:");
    console.log("  1. Go to https://demo.airwallex.com/signup");
    console.log("  2. Create a sandbox account");
    console.log("  3. Go to Settings → API Keys");
    console.log("  4. Copy Client ID and API Key to .env.local");
    process.exit(1);
  }

  // Step 1: Authenticate
  console.log("📡 Step 1: Authenticating...");
  const authRes = await fetch(`${API_URL}/api/v1/authentication/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": CLIENT_ID,
      "x-api-key": API_KEY,
    },
  });

  if (!authRes.ok) {
    const err = await authRes.text();
    console.error(`❌ Auth failed (${authRes.status}): ${err}`);
    process.exit(1);
  }

  const { token } = await authRes.json();
  console.log(`✅ Auth token: ${token.substring(0, 20)}...`);

  // Step 2: Create test payment intent
  console.log("\n📡 Step 2: Creating $1.00 USD test payment intent...");
  const requestId = `test_${Date.now()}`;
  const intentRes = await fetch(`${API_URL}/api/v1/pa/payment_intents/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      amount: 1.00,
      currency: "USD",
      merchant_order_id: `TEST-${Date.now()}`,
      descriptor: "Doge Consulting Test",
      metadata: {
        test: "true",
        source: "test-airwallex.ts",
      },
      request_id: requestId,
    }),
  });

  if (!intentRes.ok) {
    const err = await intentRes.text();
    console.error(`❌ Create intent failed (${intentRes.status}): ${err}`);
    process.exit(1);
  }

  const intent = await intentRes.json();
  console.log(`✅ Payment Intent created!`);
  console.log(`   ID:            ${intent.id}`);
  console.log(`   Status:        ${intent.status}`);
  console.log(`   Amount:        ${intent.currency} ${intent.amount}`);
  console.log(`   Client Secret: ${intent.client_secret?.substring(0, 20)}...`);

  // Step 3: Build checkout URL
  const env = process.env.NEXT_PUBLIC_AIRWALLEX_ENV === "production" ? "checkout" : "checkout-demo";
  const checkoutUrl = `https://${env}.airwallex.com/#/standalone/checkout`
    + `?intent_id=${intent.id}`
    + `&client_secret=${encodeURIComponent(intent.client_secret)}`
    + `&currency=USD`
    + `&mode=payment`;

  console.log(`\n🔗 Checkout URL:\n${checkoutUrl}`);
  console.log(`\n🎉 All tests passed! Airwallex integration is working.`);

  // Test card for sandbox:
  console.log(`\n💳 Sandbox Test Card:`);
  console.log(`   Number: 4035 5010 0000 0008`);
  console.log(`   Expiry: Any future date (e.g. 12/30)`);
  console.log(`   CVC:    Any 3 digits (e.g. 123)`);
  console.log(`   Name:   Any name`);
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
