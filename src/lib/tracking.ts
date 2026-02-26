// Shipment tracking data types and mock data

export type ShipmentStatus =
  | "order_confirmed"
  | "items_sourced"
  | "quality_inspected"
  | "packed_shenzhen"
  | "departed_china"
  | "in_transit"
  | "arrived_seattle"
  | "customs_cleared"
  | "out_for_delivery"
  | "delivered";

export interface ShipmentMilestone {
  status: ShipmentStatus;
  label: string;
  labelZh: string;
  description: string;
  date?: string;
  completed: boolean;
  active: boolean;
}

export interface Shipment {
  trackingId: string;
  orderId: string;
  customerName: string;
  origin: string;
  destination: string;
  items: string[];
  totalCBM: number;
  totalWeight: number;
  method: string;
  milestones: ShipmentMilestone[];
  estimatedDelivery: string;
  vesselName?: string;
}

export function getDefaultMilestones(currentStatus?: ShipmentStatus): ShipmentMilestone[] {
  const statuses: { status: ShipmentStatus; label: string; labelZh: string; description: string }[] = [
    { status: "order_confirmed", label: "Order Confirmed", labelZh: "订单确认", description: "Your order has been confirmed and payment received." },
    { status: "items_sourced", label: "Items Sourced", labelZh: "产品采购", description: "Items have been sourced from Chinese manufacturers." },
    { status: "quality_inspected", label: "Quality Inspected", labelZh: "质量检验", description: "All items passed quality inspection." },
    { status: "packed_shenzhen", label: "Packed & Loaded", labelZh: "包装装柜", description: "Items packed and loaded at Shenzhen warehouse." },
    { status: "departed_china", label: "Departed China", labelZh: "离开中国", description: "Shipment departed from Chinese port." },
    { status: "in_transit", label: "In Transit", labelZh: "运输中", description: "Currently on the water en route to Seattle." },
    { status: "arrived_seattle", label: "Arrived Seattle", labelZh: "到达西雅图", description: "Arrived at Port of Seattle / Tacoma." },
    { status: "customs_cleared", label: "Customs Cleared", labelZh: "清关完成", description: "US customs clearance completed." },
    { status: "out_for_delivery", label: "Out for Delivery", labelZh: "派送中", description: "Your shipment is on the way!" },
    { status: "delivered", label: "Delivered", labelZh: "已送达", description: "Successfully delivered to your address." },
  ];

  let reachedCurrent = false;

  return statuses.map((s) => {
    if (reachedCurrent) {
      return { ...s, completed: false, active: false };
    }
    if (s.status === currentStatus) {
      reachedCurrent = true;
      return { ...s, completed: false, active: true };
    }
    return { ...s, completed: true, active: false, date: "Completed" };
  });
}

// Demo tracking data
export const DEMO_SHIPMENTS: Record<string, Shipment> = {
  "DC-2026-001": {
    trackingId: "DC-2026-001",
    orderId: "ORD-001",
    customerName: "John Smith",
    origin: "Shenzhen, Guangdong, China",
    destination: "Seattle, WA, USA",
    items: ["Marble Dining Table", "6x Dining Chairs", "TV Console", "Coffee Table"],
    totalCBM: 4.5,
    totalWeight: 280,
    method: "Sea Freight (LCL)",
    milestones: getDefaultMilestones("in_transit").map((m, i) => ({
      ...m,
      date: i < 5 ? `2026-02-${String(i * 3 + 1).padStart(2, "0")}` : undefined,
    })),
    estimatedDelivery: "March 15, 2026",
    vesselName: "COSCO Shipping Aries",
  },
  "DC-2026-002": {
    trackingId: "DC-2026-002",
    orderId: "ORD-002",
    customerName: "Sarah Chen",
    origin: "Shenzhen, Guangdong, China",
    destination: "Bellevue, WA, USA",
    items: ["King Bed Frame", "2x Nightstands", "Wardrobe", "Dresser"],
    totalCBM: 6.2,
    totalWeight: 350,
    method: "Sea Freight (LCL)",
    milestones: getDefaultMilestones("packed_shenzhen").map((m, i) => ({
      ...m,
      date: i < 4 ? `2026-02-${String(i * 4 + 5).padStart(2, "0")}` : undefined,
    })),
    estimatedDelivery: "March 25, 2026",
  },
};

export function getShipmentByTrackingId(trackingId: string): Shipment | null {
  return DEMO_SHIPMENTS[trackingId] || null;
}
