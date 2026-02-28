// Test script for all new features
async function test() {
  const BASE = "http://localhost:3000";
  let passed = 0, failed = 0;

  function check(label, ok, detail) {
    if (ok) { passed++; console.log(`  ✓ ${label}${detail ? " — " + detail : ""}`); }
    else { failed++; console.log(`  ✗ ${label}${detail ? " — " + detail : ""}`); }
  }

  try {
    // 1. Login
    const login = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@dogeconsulting.com", password: "admin123" }),
    });
    const cookie = login.headers.get("set-cookie");
    check("Login", login.status === 200, `status ${login.status}`);
    const h = { Cookie: cookie };

    // 2. Dashboard with date range
    const dash = await fetch(`${BASE}/api/admin/dashboard?from=2025-01-01&to=2026-12-31`, { headers: h });
    const dd = await dash.json();
    check("Dashboard (date range)", dash.status === 200, `revenue: ${dd.stats?.totalRevenue}`);

    // 3. Quotes pagination
    const quotes = await fetch(`${BASE}/api/admin/quotes?page=1&limit=5`, { headers: h });
    const qd = await quotes.json();
    check("Quotes pagination", quotes.status === 200 && qd.totalPages !== undefined,
      `total:${qd.total} page:${qd.page} pages:${qd.totalPages}`);

    // 4. Orders pagination
    const orders = await fetch(`${BASE}/api/admin/orders?page=1&limit=5`, { headers: h });
    const od = await orders.json();
    check("Orders pagination", orders.status === 200 && od.totalPages !== undefined,
      `total:${od.total} page:${od.page} pages:${od.totalPages}`);

    // 5. Customers pagination
    const custs = await fetch(`${BASE}/api/admin/customers?page=1&limit=10`, { headers: h });
    const cd = await custs.json();
    check("Customers pagination", custs.status === 200 && cd.totalPages !== undefined,
      `total:${cd.total} page:${cd.page} pages:${cd.totalPages}`);

    // 6. Products pagination
    const prods = await fetch(`${BASE}/api/admin/products?page=1&limit=10`, { headers: h });
    const pd = await prods.json();
    check("Products pagination", prods.status === 200 && pd.totalPages !== undefined,
      `total:${pd.total} page:${pd.page} pages:${pd.totalPages}`);

    // 7. Profile GET
    const prof = await fetch(`${BASE}/api/customer/profile`, { headers: h });
    const prd = await prof.json();
    check("Profile GET", prof.status === 200 && prd.user?.email,
      `name:${prd.user?.name} email:${prd.user?.email}`);

    // 8. Profile PATCH
    const profUp = await fetch(`${BASE}/api/customer/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ name: "Admin User", phone: "+1-555-0100", company: "Doge Consulting" }),
    });
    const pud = await profUp.json();
    check("Profile UPDATE", profUp.status === 200, `name:${pud.user?.name}`);

    // 9. Password change - wrong current
    const pwBad = await fetch(`${BASE}/api/customer/password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ currentPassword: "wrongpw", newPassword: "newpass123" }),
    });
    check("Password (bad current → 400)", pwBad.status === 400, `status:${pwBad.status}`);

    // 10. Password change - correct (reset back to same)
    const pwGood = await fetch(`${BASE}/api/customer/password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ currentPassword: "admin123", newPassword: "admin123" }),
    });
    check("Password (correct → 200)", pwGood.status === 200, `status:${pwGood.status}`);

    // 11. Bulk quotes API
    const bulkQ = await fetch(`${BASE}/api/admin/quotes/bulk`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ ids: [], status: "sent" }),
    });
    // Empty ids should return 400
    check("Bulk quotes (empty ids → 400)", bulkQ.status === 400, `status:${bulkQ.status}`);

    // 12. Bulk orders API
    const bulkO = await fetch(`${BASE}/api/admin/orders/bulk`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ ids: [], status: "confirmed" }),
    });
    check("Bulk orders (empty ids → 400)", bulkO.status === 400, `status:${bulkO.status}`);

    // 13. Pages load
    const pages = ["/admin", "/admin/quotes", "/admin/orders", "/admin/customers", "/admin/products"];
    for (const p of pages) {
      const r = await fetch(`${BASE}${p}`, { headers: h });
      check(`Page ${p}`, r.status === 200, `status:${r.status}`);
    }

    console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  } catch (e) {
    console.error("Fatal:", e.message);
  }
}

test();
