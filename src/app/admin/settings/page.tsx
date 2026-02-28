"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, DollarSign, Truck, Shield, Save, Bell, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

type SettingsMap = Record<string, string>;

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const set = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const toggleBool = (key: string) => {
    setSettings((prev) => ({ ...prev, [key]: prev[key] === "true" ? "false" : "true" }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        toast.success("Settings saved successfully!");
      } else {
        toast.error("Failed to save settings");
      }
    } catch {
      toast.error("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    setTestingEmail(true);
    try {
      const res = await fetch("/api/admin/settings/test-email", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Test email sent!");
      } else {
        toast.error(data.error || "Failed to send test email");
      }
    } catch {
      toast.error("Error sending test email");
    } finally {
      setTestingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-teal" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage pricing rules and system configuration</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-teal hover:bg-teal/90 gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pricing Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-teal" />Pricing Rules</CardTitle>
            <CardDescription>Configure shipping rates and fees</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>LCL Rate ($/CBM) Min</Label>
                <Input type="number" value={settings.lcl_rate_min || ""} onChange={(e) => set("lcl_rate_min", e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>LCL Rate ($/CBM) Max</Label>
                <Input type="number" value={settings.lcl_rate_max || ""} onChange={(e) => set("lcl_rate_max", e.target.value)} className="mt-1" />
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>FCL 20GP Rate ($)</Label>
                <Input type="number" value={settings.fcl_20gp_rate || ""} onChange={(e) => set("fcl_20gp_rate", e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>FCL 40GP Rate ($)</Label>
                <Input type="number" value={settings.fcl_40gp_rate || ""} onChange={(e) => set("fcl_40gp_rate", e.target.value)} className="mt-1" />
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Export Clearance ($)</Label>
                <Input type="number" value={settings.export_clearance || ""} onChange={(e) => set("export_clearance", e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Destination Fees ($)</Label>
                <Input type="number" value={settings.destination_fees || ""} onChange={(e) => set("destination_fees", e.target.value)} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Last-Mile Delivery ($)</Label>
                <Input type="number" value={settings.last_mile || ""} onChange={(e) => set("last_mile", e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Customs Rate (%)</Label>
                <Input type="number" value={settings.customs_rate || ""} onChange={(e) => set("customs_rate", e.target.value)} className="mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5 text-teal" />Shipping Settings</CardTitle>
            <CardDescription>Configure shipping parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Estimated Transit (weeks min)</Label>
                <Input type="number" value={settings.transit_min_weeks || ""} onChange={(e) => set("transit_min_weeks", e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Estimated Transit (weeks max)</Label>
                <Input type="number" value={settings.transit_max_weeks || ""} onChange={(e) => set("transit_max_weeks", e.target.value)} className="mt-1" />
              </div>
            </div>
            <Separator />
            <div>
              <Label>Insurance Rate (%)</Label>
              <Input type="number" value={settings.insurance_rate || ""} onChange={(e) => set("insurance_rate", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Deposit Percentage (%)</Label>
              <Input type="number" value={settings.deposit_percent || ""} onChange={(e) => set("deposit_percent", e.target.value)} className="mt-1" />
            </div>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">Auto-approve small quotes</p><p className="text-xs text-muted-foreground">Auto-approve quotes under $2,000</p></div>
                <Switch checked={settings.auto_approve === "true"} onCheckedChange={() => toggleBool("auto_approve")} />
              </div>
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">Volume discount</p><p className="text-xs text-muted-foreground">Apply 10% off for orders &gt; 15 CBM</p></div>
                <Switch checked={settings.volume_discount === "true"} onCheckedChange={() => toggleBool("volume_discount")} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-teal" />Payment (Airwallex)</CardTitle>
            <CardDescription>Payment processor configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Airwallex Client ID</Label>
              <Input type="password" placeholder="••••••••••••" className="mt-1" disabled />
              <p className="text-xs text-muted-foreground mt-1">Set via AIRWALLEX_CLIENT_ID env variable</p>
            </div>
            <div>
              <Label>Airwallex API Key</Label>
              <Input type="password" placeholder="••••••••••••" className="mt-1" disabled />
              <p className="text-xs text-muted-foreground mt-1">Set via AIRWALLEX_API_KEY env variable</p>
            </div>
            <div>
              <Label>Webhook Secret</Label>
              <Input type="password" placeholder="••••••••••••" className="mt-1" disabled />
              <p className="text-xs text-muted-foreground mt-1">Set via AIRWALLEX_WEBHOOK_SECRET env variable</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Demo Mode</p>
                <p className="text-xs text-muted-foreground">Use sandbox environment</p>
              </div>
              <Switch checked={settings.airwallex_demo === "true"} onCheckedChange={() => toggleBool("airwallex_demo")} />
            </div>
            <Badge variant="outline" className="gap-1"><Settings className="h-3 w-3" /> Environment: {settings.airwallex_demo === "true" ? "Demo" : "Live"}</Badge>
          </CardContent>
        </Card>

        {/* Notifications & SMTP */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-teal" />Notifications &amp; Email</CardTitle>
            <CardDescription>SMTP configuration and notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* SMTP section */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>SMTP Host</Label>
                <Input value={settings.smtp_host || ""} onChange={(e) => set("smtp_host", e.target.value)} placeholder="smtp.gmail.com" className="mt-1" />
              </div>
              <div>
                <Label>SMTP Port</Label>
                <Input type="number" value={settings.smtp_port || ""} onChange={(e) => set("smtp_port", e.target.value)} placeholder="587" className="mt-1" />
              </div>
            </div>
            <div>
              <Label>SMTP Username / Email</Label>
              <Input value={settings.smtp_user || ""} onChange={(e) => set("smtp_user", e.target.value)} placeholder="your-email@gmail.com" className="mt-1" />
            </div>
            <div>
              <Label>SMTP Password / App Password</Label>
              <Input type="password" value={settings.smtp_pass || ""} onChange={(e) => set("smtp_pass", e.target.value)} placeholder="••••••••••••" className="mt-1" />
              <p className="text-xs text-muted-foreground mt-1">
                For Gmail: use an <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-teal underline">App Password</a> (requires 2FA enabled).
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleTestEmail} disabled={testingEmail} className="gap-1">
                <Send className="h-3 w-3" />
                {testingEmail ? "Sending..." : "Send Test Email"}
              </Button>
              {!settings.smtp_pass && <Badge variant="secondary">SMTP not configured — emails logged to console</Badge>}
              {settings.smtp_pass && <Badge variant="default" className="bg-green-600">SMTP configured</Badge>}
            </div>
            <Separator />
            {/* Admin & notification toggles */}
            <div>
              <Label>Admin Email (receives notifications)</Label>
              <Input type="email" value={settings.admin_email || ""} onChange={(e) => set("admin_email", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>WeChat ID (for alerts)</Label>
              <Input value={settings.wechat_id || ""} onChange={(e) => set("wechat_id", e.target.value)} className="mt-1" />
            </div>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">New quote notifications</p><p className="text-xs text-muted-foreground">Email when quote is sent to customer</p></div>
                <Switch checked={settings.notify_quote === "true"} onCheckedChange={() => toggleBool("notify_quote")} />
              </div>
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">Payment notifications</p><p className="text-xs text-muted-foreground">Email on payment events</p></div>
                <Switch checked={settings.notify_payment === "true"} onCheckedChange={() => toggleBool("notify_payment")} />
              </div>
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">Shipment status updates</p><p className="text-xs text-muted-foreground">Email customer when order status changes</p></div>
                <Switch checked={settings.notify_shipment === "true"} onCheckedChange={() => toggleBool("notify_shipment")} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
