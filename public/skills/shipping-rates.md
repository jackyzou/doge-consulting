# Shipping Rates — Agent Skill

Get current container freight rates between China and US/Canada/Mexico ports.

## Endpoint

```
GET https://doge-consulting.com/api/tools/shipping-rates?origin=shenzhen&destination=la
```

## Parameters (query string)

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| origin | string | No | "shenzhen" | Origin port: shenzhen, hongkong, shanghai, suzhou |
| destination | string | No | "la" | Destination: la, sea, pdx, oak, van, mzn, lzc |

## Response

Returns current rate in USD per FEU (40ft container), plus all available routes.

## Example

```
GET /api/tools/shipping-rates?origin=shenzhen&destination=sea
```

```json
{
  "ok": true,
  "route": { "origin": "Shenzhen", "destination": "Seattle" },
  "currentRate": {
    "amount": 2596,
    "currency": "USD",
    "unit": "FEU (40ft container)",
    "lastUpdated": "2026-03-24"
  }
}
```

## Data Sources

Rates compiled from Freightos Baltic Index (FBX), Drewry World Container Index (WCI), and Xeneta XSI. Updated weekly.

## Interactive UI

https://doge-consulting.com/tools/shipping-tracker
