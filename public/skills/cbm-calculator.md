# CBM Calculator — Agent Skill

Calculate cubic meters, volumetric weight, and container fit for shipping.

## Endpoint

```
POST https://doge-consulting.com/api/tools/cbm-calculator
Content-Type: application/json
```

## Quick Start

```json
{
  "items": [
    { "name": "Roller Blind", "length": 180, "width": 12, "height": 12, "weight": 3, "quantity": 500, "unit": "cm" }
  ]
}
```

Or single item:

```json
{
  "name": "Roller Blind",
  "length": 180,
  "width": 12,
  "height": 12,
  "weight": 3,
  "quantity": 500,
  "unit": "cm"
}
```

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| length (or l) | number | **Yes** | — | Length of item |
| width (or w) | number | **Yes** | — | Width of item |
| height (or h) | number | **Yes** | — | Height of item |
| weight (or wt) | number | No | 0 | Actual weight in kg |
| quantity (or qty) | number | No | 1 | Number of units |
| unit | string | No | "cm" | Dimension unit: cm, mm, in, ft, m |
| name | string | No | — | Item description |
| items | array | No | — | Array of items for batch calculation |

## Response

Per item: CBM, volumetric weight, chargeable weight, container fit (units per 20ft/40ft).
Summary: total CBM, containers needed.

## Interactive UI

https://doge-consulting.com/tools/cbm-calculator
