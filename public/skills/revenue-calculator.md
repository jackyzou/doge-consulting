# Revenue Calculator — Agent Skill

Calculate import profitability including duties, tariffs, landed costs, and ROI.

## Endpoint

```
POST https://doge-consulting.com/api/tools/revenue-calculator
Content-Type: application/json
```

## Quick Start

```json
{
  "sourceCountry": "china",
  "destination": "us",
  "productCategory": "window-blinds",
  "productCostPerUnit": 18,
  "quantity": 500,
  "freightCostTotal": 1750,
  "sellingPricePerUnit": 79,
  "includeSection301": true,
  "includeSection122": true
}
```

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| sourceCountry | string | No | "china" | Origin country ID. Options: china, vietnam, india, taiwan, thailand, mexico, turkey, indonesia, bangladesh, south-korea, germany, italy, other |
| destination | string | No | "us" | Destination ID. Options: us, ca, gb, eu, au |
| productCategory | string | No | "furniture-wood" | Product category for duty rates. See GET endpoint for full list |
| productCostPerUnit | number | **Yes** | — | FOB price per unit in USD |
| quantity | number | **Yes** | — | Number of units |
| freightCostTotal | number | No | 0 | Total shipping cost in USD |
| sellingPricePerUnit | number | No | 0 | Your retail price per unit |
| includeSection301 | boolean | No | true | Apply 25% Section 301 tariff (China goods) |
| includeSection122 | boolean | No | false | Apply reciprocal tariff |
| complianceProfile | string | No | "standard" | Compliance profile. Options: standard, food-contact, electronics-fcc, electronics-ul, children-cpsc, textiles-cpsc, flammability, fda-cosmetics, fda-medical |
| freightMode | string | No | "ocean-lcl" | Options: ocean-lcl, ocean-fcl, air, express |
| incoterm | string | No | "FOB" | Options: EXW, FOB, CIF, DDP |

## Response

Returns landed cost breakdown, gross profit, ROI, and effective tax rate.

## Discovery

```
GET https://doge-consulting.com/api/tools/revenue-calculator
```

Returns available options (all product categories, countries, compliance profiles).

## Interactive UI

https://doge-consulting.com/tools/revenue-calculator
