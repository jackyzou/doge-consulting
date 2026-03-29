# Duty Calculator — Agent Skill

Calculate US import duty by product category and origin country.

## Endpoint

```
POST https://doge-consulting.com/api/tools/duty-calculator
Content-Type: application/json
```

## Quick Start

```json
{
  "productCategory": "window-blinds",
  "productValue": 9000,
  "shippingCost": 1750,
  "insuranceCost": 45,
  "originCountry": "china",
  "includeSection301": true
}
```

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| productCategory | string | No | "furniture-wood" | HTS product category. Use GET for full list |
| productValue | number | **Yes** | — | Total product value (FOB) in USD |
| shippingCost | number | No | 0 | Freight cost in USD |
| insuranceCost | number | No | 0 | Insurance cost in USD |
| originCountry | string | No | "china" | Country of origin |
| includeSection301 | boolean | No | true for China | Apply 25% Section 301 tariff |

## Response

Returns customs value, base duty, Section 301 duty, MPF, HMF, total duty, and effective rate.

## Discovery

```
GET https://doge-consulting.com/api/tools/duty-calculator
```

## Interactive UI

https://doge-consulting.com/tools/duty-calculator
