"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Ship, Search, Plus, Package, MapPin, Clock, Trash2,
  ChevronDown, ChevronUp, Loader2, Anchor, ArrowRight,
  Container, Calendar, AlertCircle, Edit, Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const STATUS_OPTIONS = [
  { value: "booked", label: "Booked", color: "bg-slate-500" },
  { value: "loaded", label: "Loaded", color: "bg-blue-500" },
  { value: "in_transit", label: "In Transit", color: "bg-teal-500" },
  { value: "transshipment", label: "Transshipment", color: "bg-amber-500" },
  { value: "arriving", label: "Arriving", color: "bg-emerald-500" },
  { value: "discharged", label: "Discharged", color: "bg-indigo-500" },
  { value: "customs", label: "Customs", color: "bg-orange-500" },
  { value: "delivered", label: "Delivered", color: "bg-green-600" },
];

const CONTAINER_TYPES = ["20GP", "40GP", "40HC", "45HC", "20RF", "40RF"];

const EVENT_STATUSES = [
  "gate_in", "loaded", "departed", "in_transit", "arrived",
  "transshipment", "discharged", "customs_hold", "released", "out_for_delivery", "delivered",
];

interface Vessel {
  id: string; name: string; imo: string | null; flag: string | null;
  carrier: string | null; vesselType: string;
}

interface ShipmentEvent {
  id: string; location: string; status: string;
  description: string | null; timestamp: string;
}

interface Shipment {
  id: string;
  containerNumber: string | null;
  containerType: string;
  sealNumber: string | null;
  voyageNumber: string | null;
  billOfLading: string | null;
  portOfLoading: string;
  portOfDischarge: string;
  placeOfReceipt: string | null;
  placeOfDelivery: string | null;
  etd: string | null;
  atd: string | null;
  eta: string | null;
  ata: string | null;
  status: string;
  grossWeightKg: number | null;
  volumeCbm: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  vessel: Vessel | null;
  events: ShipmentEvent[];
  order: { orderNumber: string; customerName: string } | null;
  orderId: string | null;
}

export default function AdminShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);

  // Event dialog
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [eventShipmentId, setEventShipmentId] = useState<string | null>(null);

  const fetchShipments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("q", search);
      const res = await fetch(`/api/admin/shipments?${params}`);
      const data = await res.json();
      setShipments(data.shipments || []);
    } catch { /* empty */ }
    setLoading(false);
  }, [statusFilter, search]);

  const fetchVessels = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/vessels");
      const data = await res.json();
      setVessels(data.vessels || []);
    } catch { /* empty */ }
  }, []);

  useEffect(() => { fetchShipments(); fetchVessels(); }, [fetchShipments, fetchVessels]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this shipment?")) return;
    await fetch(`/api/admin/shipments/${id}`, { method: "DELETE" });
    fetchShipments();
  };

  // Stats
  const stats = {
    total: shipments.length,
    inTransit: shipments.filter((s) => s.status === "in_transit").length,
    booked: shipments.filter((s) => s.status === "booked").length,
    delivered: shipments.filter((s) => s.status === "delivered").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Shipment Management</h1>
          <p className="text-sm text-slate-500 mt-1">Track and manage all container shipments</p>
        </div>
        <Button onClick={() => { setEditingShipment(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> New Shipment
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Shipments" value={stats.total} icon={Container} color="text-slate-600" />
        <StatCard label="In Transit" value={stats.inTransit} icon={Ship} color="text-teal-600" />
        <StatCard label="Booked" value={stats.booked} icon={Calendar} color="text-blue-600" />
        <StatCard label="Delivered" value={stats.delivered} icon={Package} color="text-green-600" />
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search container, B/L, voyage..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Shipment List */}
      {loading ? (
        <div className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-400" /></div>
      ) : shipments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Ship className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 text-lg">No shipments found</p>
            <p className="text-slate-400 text-sm mt-1">Create your first shipment to start tracking</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {shipments.map((s) => (
            <ShipmentCard
              key={s.id}
              shipment={s}
              expanded={expandedId === s.id}
              onToggle={() => setExpandedId(expandedId === s.id ? null : s.id)}
              onDelete={() => handleDelete(s.id)}
              onEdit={() => { setEditingShipment(s); setDialogOpen(true); }}
              onAddEvent={() => { setEventShipmentId(s.id); setEventDialogOpen(true); }}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <ShipmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        shipment={editingShipment}
        vessels={vessels}
        onSaved={() => { setDialogOpen(false); fetchShipments(); }}
      />

      {/* Add Event Dialog */}
      <EventDialog
        open={eventDialogOpen}
        onOpenChange={setEventDialogOpen}
        shipmentId={eventShipmentId}
        onSaved={() => { setEventDialogOpen(false); fetchShipments(); }}
      />
    </div>
  );
}

/* ── Stat Card ── */
function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: typeof Ship; color: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <Icon className={`h-8 w-8 ${color}`} />
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Shipment Card ── */
function ShipmentCard({
  shipment, expanded, onToggle, onDelete, onEdit, onAddEvent,
}: {
  shipment: Shipment; expanded: boolean; onToggle: () => void;
  onDelete: () => void; onEdit: () => void; onAddEvent: () => void;
}) {
  const st = STATUS_OPTIONS.find((s) => s.value === shipment.status) || { label: shipment.status, color: "bg-slate-500" };

  return (
    <Card className="overflow-hidden">
      <button onClick={onToggle} className="w-full p-4 text-left hover:bg-slate-50 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Ship className="h-5 w-5 text-teal-600 shrink-0" />
            <div>
              <p className="font-semibold">
                {shipment.containerNumber || shipment.billOfLading || `Shipment ${shipment.id.slice(-6)}`}
              </p>
              <p className="text-xs text-slate-500">
                {shipment.portOfLoading} → {shipment.portOfDischarge}
                {shipment.vessel && ` · ${shipment.vessel.name}`}
                {shipment.order && ` · ${shipment.order.orderNumber}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${st.color} text-white text-xs`}>{st.label}</Badge>
            {shipment.eta && (
              <span className="text-xs text-slate-400 hidden sm:inline">
                ETA: {new Date(shipment.eta).toLocaleDateString()}
              </span>
            )}
            {expanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t space-y-4">
          {/* Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-sm">
            <Detail label="Container" value={shipment.containerNumber || "—"} />
            <Detail label="Type" value={shipment.containerType} />
            <Detail label="B/L" value={shipment.billOfLading || "—"} />
            <Detail label="Voyage" value={shipment.voyageNumber || "—"} />
            <Detail label="Seal" value={shipment.sealNumber || "—"} />
            <Detail label="ETD" value={shipment.etd ? new Date(shipment.etd).toLocaleDateString() : "—"} />
            <Detail label="ETA" value={shipment.eta ? new Date(shipment.eta).toLocaleDateString() : "—"} />
            <Detail label="ATA" value={shipment.ata ? new Date(shipment.ata).toLocaleDateString() : "—"} />
            {shipment.grossWeightKg && <Detail label="Weight" value={`${shipment.grossWeightKg.toLocaleString()} kg`} />}
            {shipment.volumeCbm && <Detail label="Volume" value={`${shipment.volumeCbm} CBM`} />}
            {shipment.vessel?.carrier && <Detail label="Carrier" value={shipment.vessel.carrier} />}
            {shipment.order && <Detail label="Order" value={`${shipment.order.orderNumber} · ${shipment.order.customerName}`} />}
          </div>

          {shipment.notes && (
            <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded">{shipment.notes}</p>
          )}

          {/* Events timeline */}
          {shipment.events.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                <Clock className="h-4 w-4 text-teal-600" /> Recent Events
              </h4>
              <div className="space-y-2 ml-2">
                {shipment.events.map((evt) => (
                  <div key={evt.id} className="flex items-start gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                    <div className="flex-1 flex justify-between">
                      <div>
                        <span className="font-medium">{evt.location}</span>
                        {evt.description && <span className="text-slate-500"> — {evt.description}</span>}
                      </div>
                      <span className="text-xs text-slate-400 shrink-0">
                        {new Date(evt.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" onClick={onEdit}>
              <Edit className="h-3.5 w-3.5 mr-1" /> Edit
            </Button>
            <Button size="sm" variant="outline" onClick={onAddEvent}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Event
            </Button>
            <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

/* ── Create/Edit Shipment Dialog ── */
function ShipmentDialog({
  open, onOpenChange, shipment, vessels, onSaved,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  shipment: Shipment | null; vessels: Vessel[]; onSaved: () => void;
}) {
  const [form, setForm] = useState({
    containerNumber: "", containerType: "40HC", sealNumber: "",
    vesselId: "", voyageNumber: "", billOfLading: "",
    portOfLoading: "Shenzhen (CNSZX)", portOfDischarge: "Seattle (USSEA)",
    placeOfReceipt: "", placeOfDelivery: "",
    etd: "", atd: "", eta: "", ata: "",
    status: "booked", grossWeightKg: "", volumeCbm: "",
    orderId: "", notes: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (shipment) {
      setForm({
        containerNumber: shipment.containerNumber || "",
        containerType: shipment.containerType,
        sealNumber: shipment.sealNumber || "",
        vesselId: shipment.vessel?.id || "",
        voyageNumber: shipment.voyageNumber || "",
        billOfLading: shipment.billOfLading || "",
        portOfLoading: shipment.portOfLoading,
        portOfDischarge: shipment.portOfDischarge,
        placeOfReceipt: shipment.placeOfReceipt || "",
        placeOfDelivery: shipment.placeOfDelivery || "",
        etd: shipment.etd ? new Date(shipment.etd).toISOString().slice(0, 10) : "",
        atd: shipment.atd ? new Date(shipment.atd).toISOString().slice(0, 10) : "",
        eta: shipment.eta ? new Date(shipment.eta).toISOString().slice(0, 10) : "",
        ata: shipment.ata ? new Date(shipment.ata).toISOString().slice(0, 10) : "",
        status: shipment.status,
        grossWeightKg: shipment.grossWeightKg?.toString() || "",
        volumeCbm: shipment.volumeCbm?.toString() || "",
        orderId: shipment.orderId || "",
        notes: shipment.notes || "",
      });
    } else {
      setForm({
        containerNumber: "", containerType: "40HC", sealNumber: "",
        vesselId: "", voyageNumber: "", billOfLading: "",
        portOfLoading: "Shenzhen (CNSZX)", portOfDischarge: "Seattle (USSEA)",
        placeOfReceipt: "", placeOfDelivery: "",
        etd: "", atd: "", eta: "", ata: "",
        status: "booked", grossWeightKg: "", volumeCbm: "",
        orderId: "", notes: "",
      });
    }
  }, [shipment, open]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (shipment) {
        await fetch(`/api/admin/shipments/${shipment.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        await fetch("/api/admin/shipments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      onSaved();
    } catch { /* empty */ }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{shipment ? "Edit Shipment" : "Create Shipment"}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <Label>Container Number</Label>
            <Input placeholder="CSLU6543210" value={form.containerNumber} onChange={(e) => setForm({ ...form, containerNumber: e.target.value })} />
          </div>
          <div>
            <Label>Container Type</Label>
            <Select value={form.containerType} onValueChange={(v) => setForm({ ...form, containerType: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CONTAINER_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Bill of Lading</Label>
            <Input placeholder="BL number" value={form.billOfLading} onChange={(e) => setForm({ ...form, billOfLading: e.target.value })} />
          </div>
          <div>
            <Label>Seal Number</Label>
            <Input placeholder="Seal #" value={form.sealNumber} onChange={(e) => setForm({ ...form, sealNumber: e.target.value })} />
          </div>
          <div>
            <Label>Vessel</Label>
            <Select value={form.vesselId} onValueChange={(v) => setForm({ ...form, vesselId: v })}>
              <SelectTrigger><SelectValue placeholder="Select vessel" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {vessels.map((v) => <SelectItem key={v.id} value={v.id}>{v.name} {v.carrier ? `(${v.carrier})` : ""}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Voyage Number</Label>
            <Input placeholder="0W1E5S1MA" value={form.voyageNumber} onChange={(e) => setForm({ ...form, voyageNumber: e.target.value })} />
          </div>
          <div>
            <Label>Port of Loading</Label>
            <Input value={form.portOfLoading} onChange={(e) => setForm({ ...form, portOfLoading: e.target.value })} />
          </div>
          <div>
            <Label>Port of Discharge</Label>
            <Input value={form.portOfDischarge} onChange={(e) => setForm({ ...form, portOfDischarge: e.target.value })} />
          </div>
          <div>
            <Label>Place of Receipt</Label>
            <Input placeholder="Factory / warehouse" value={form.placeOfReceipt} onChange={(e) => setForm({ ...form, placeOfReceipt: e.target.value })} />
          </div>
          <div>
            <Label>Place of Delivery</Label>
            <Input placeholder="Final destination" value={form.placeOfDelivery} onChange={(e) => setForm({ ...form, placeOfDelivery: e.target.value })} />
          </div>
          <div>
            <Label>ETD</Label>
            <Input type="date" value={form.etd} onChange={(e) => setForm({ ...form, etd: e.target.value })} />
          </div>
          <div>
            <Label>ATD</Label>
            <Input type="date" value={form.atd} onChange={(e) => setForm({ ...form, atd: e.target.value })} />
          </div>
          <div>
            <Label>ETA</Label>
            <Input type="date" value={form.eta} onChange={(e) => setForm({ ...form, eta: e.target.value })} />
          </div>
          <div>
            <Label>ATA</Label>
            <Input type="date" value={form.ata} onChange={(e) => setForm({ ...form, ata: e.target.value })} />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Order ID (optional)</Label>
            <Input placeholder="cuid" value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value })} />
          </div>
          <div>
            <Label>Gross Weight (kg)</Label>
            <Input type="number" value={form.grossWeightKg} onChange={(e) => setForm({ ...form, grossWeightKg: e.target.value })} />
          </div>
          <div>
            <Label>Volume (CBM)</Label>
            <Input type="number" step="0.01" value={form.volumeCbm} onChange={(e) => setForm({ ...form, volumeCbm: e.target.value })} />
          </div>
          <div className="col-span-2">
            <Label>Notes</Label>
            <Input placeholder="Optional notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {shipment ? "Save Changes" : "Create Shipment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Add Event Dialog ── */
function EventDialog({
  open, onOpenChange, shipmentId, onSaved,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  shipmentId: string | null; onSaved: () => void;
}) {
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("in_transit");
  const [description, setDescription] = useState("");
  const [timestamp, setTimestamp] = useState(new Date().toISOString().slice(0, 16));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setLocation("");
      setStatus("in_transit");
      setDescription("");
      setTimestamp(new Date().toISOString().slice(0, 16));
    }
  }, [open]);

  const handleSave = async () => {
    if (!shipmentId || !location) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/shipments/${shipmentId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, status, description, timestamp }),
      });
      onSaved();
    } catch { /* empty */ }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Tracking Event</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label>Location *</Label>
            <Input placeholder="e.g. Yantian, China" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div>
            <Label>Event Status *</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {EVENT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Description (optional)</Label>
            <Input placeholder="Free-text detail" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label>Timestamp</Label>
            <Input type="datetime-local" value={timestamp} onChange={(e) => setTimestamp(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !location}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Add Event
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
