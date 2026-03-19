// Test creating an actual payment intent with Airwallex
async function test() {
  // Step 1: Authenticate
  const authRes = await fetch('https://api.airwallex.com/api/v1/authentication/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': '5LsAA4vpRhy9odym2CJDDQ',
      'x-api-key': 'e3c7b2b062a41aed8fb34b7e58e45b51137ef40ab89c9799f30cb96cf9d20599eeb2c5f03e7cab3d93710392c8b9e8d7',
    },
  });
  
  if (!authRes.ok) {
    console.log('❌ Auth failed:', authRes.status, await authRes.text());
    return;
  }
  
  const authData = await authRes.json();
  console.log('✅ Auth OK, token:', authData.token?.substring(0, 30) + '...');
  
  // Step 2: Create a test payment intent
  const intentRes = await fetch('https://api.airwallex.com/api/v1/pa/payment_intents/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authData.token}`,
    },
    body: JSON.stringify({
      amount: 10.00,
      currency: 'USD',
      merchant_order_id: 'TEST-' + Date.now(),
      descriptor: 'Doge Test Payment',
      request_id: 'req_test_' + Date.now(),
      return_url: 'https://doge-consulting.com/payment/success',
    }),
  });
  
  const intentData = await intentRes.json();
  
  if (intentRes.ok) {
    console.log('✅ Payment intent created!');
    console.log('   ID:', intentData.id);
    console.log('   Status:', intentData.status);
    console.log('   Amount:', intentData.amount, intentData.currency);
    
    // Build checkout URL
    const checkoutUrl = `https://checkout.airwallex.com/#/standalone/checkout?intent_id=${intentData.id}&client_secret=${encodeURIComponent(intentData.client_secret)}&currency=${intentData.currency}&mode=payment`;
    console.log('   Checkout URL:', checkoutUrl.substring(0, 80) + '...');
  } else {
    console.log('❌ Payment intent FAILED:', intentRes.status);
    console.log('   Error:', JSON.stringify(intentData, null, 2));
  }
}

test().catch(e => console.error('Error:', e.message));
