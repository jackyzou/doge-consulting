"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, DollarSign, Truck, Shield, Save, Bell, Globe } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    toast.success("Settings saved successfully!");
  };

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
                <Input type="number" defaultValue="150" className="mt-1" />
              </div>
              <div>
                <Label>LCL Rate ($/CBM) Max</Label>
                <Input type="number" defaultValue="250" className="mt-1" />
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>FCL 20GP Rate ($)</Label>
                <Input type="number" defaultValue="2500" className="mt-1" />
              </div>
              <div>
                <Label>FCL 40GP Rate ($)</Label>
                <Input type="number" defaultValue="4200" className="mt-1" />
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Export Clearance ($)</Label>
                <Input type="number" defaultValue="200" className="mt-1" />
              </div>
              <div>
                <Label>Destination Fees ($)</Label>
                <Input type="number" defaultValue="700" className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Last-Mile Delivery ($)</Label>
                <Input type="number" defaultValue="400" className="mt-1" />
              </div>
              <div>
                <Label>Customs Rate (%)</Label>
                <Input type="number" defaultValue="3" className="mt-1" />
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
                <Input type="number" defaultValue="5" className="mt-1" />
              </div>
              <div>
                <Label>Estimated Transit (weeks max)</Label>
                <Input type="number" defaultValue="8" className="mt-1" />
              </div>
            </div>
            <Separator />
            <div>
              <Label>Insurance Rate (%)</Label>
              <Input type="number" defaultValue="2" className="mt-1" />
            </div>
            <div>
              <Label>Deposit Percentage (%)</Label>
              <Input type="number" defaultValue="70" className="mt-1" />
            </div>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">Auto-approve small quotes</p><p className="text-xs text-muted-foreground">Auto-approve quotes under $2,000</p></div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">Volume discount</p><p className="text-xs text-muted-foreground">Apply 10% off for orders &gt; 15 CBM</p></div>
                <Switch defaultChecked />
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
              <Input type="password" defaultValue="••••••••••••" className="mt-1" />
            </div>
            <div>
              <Label>Airwallex API Key</Label>
              <Input type="password" defaultValue="••••••••••••" className="mt-1" />
            </div>
            <div>
              <Label>Webhook Secret</Label>
              <Input type="password" defaultValue="••••••••••••" className="mt-1" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Demo Mode</p>
                <p className="text-xs text-muted-foreground">Use sandbox environment</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Badge variant="outline" className="gap-1"><Settings className="h-3 w-3" /> Environment: Demo</Badge>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-teal" />Notifications</CardTitle>
            <CardDescription>Email and alert preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Admin Email</Label>
              <Input type="email" defaultValue="dogetech77@gmail.com" className="mt-1" />
            </div>
            <div>
              <Label>WeChat ID (for alerts)</Label>
              <Input defaultValue="DogeConsulting" className="mt-1" />
            </div>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">New quote notifications</p><p className="text-xs text-muted-foreground">Email when new quote submitted</p></div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">Payment notifications</p><p className="text-xs text-muted-foreground">Email on payment events</p></div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">Shipment status updates</p><p className="text-xs text-muted-foreground">Alert on status changes</p></div>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
