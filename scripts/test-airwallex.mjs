// Test Airwallex API connection
async function test() {
  const url = 'https://api.airwallex.com/api/v1/authentication/login';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': '5LsAA4vpRhy9odym2CJDDQ',
      'x-api-key': 'e3c7b2b062a41aed8fb34b7e58e45b51137ef40ab89c9799f30cb96cf9d20599eeb2c5f03e7cab3d93710392c8b9e8d7',
    },
  });
  const data = await res.json();
  if (res.ok) {
    console.log('✅ SUCCESS: Airwallex API authenticated!');
    console.log('   Token:', data.token?.substring(0, 40) + '...');
    console.log('   Expires:', data.expires_at);
  } else {
    console.log('❌ FAILED:', res.status, JSON.stringify(data));
  }
}
test().catch(e => console.error('Error:', e.message));
