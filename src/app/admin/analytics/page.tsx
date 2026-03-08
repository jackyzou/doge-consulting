"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3, Eye, Users, Globe, Smartphone, Monitor, Tablet,
  TrendingUp, ArrowUpRight, Loader2, Mail, MapPin,
} from "lucide-react";

interface AnalyticsData {
  period: { days: number; since: string };
  today: { pageViews: number; uniqueVisitors: number };
  totals: { pageViews: number; uniqueVisitors: number; totalCustomers: number; totalSubscribers: number; newCustomers: number; newSubscribers: number };
  timeSeries: { viewsByDay: Record<string, number>; visitorsByDay: Record<string, number>; customersByDay: Record<string, number>; subscribersByDay: Record<string, number> };
  topPages: { path: string; views: number }[];
  countries: { country: string; views: number }[];
  devices: Record<string, number>;
  subscriberLanguages: Record<string, number>;
}

const COUNTRY_FLAGS: Record<string, string> = {
  US: "🇺🇸", CN: "🇨🇳", HK: "🇭🇰", TW: "🇹🇼", CA: "🇨🇦", GB: "🇬🇧", AU: "🇦🇺", DE: "🇩🇪",
  FR: "🇫🇷", JP: "🇯🇵", KR: "🇰🇷", IN: "🇮🇳", MX: "🇲🇽", BR: "🇧🇷", SG: "🇸🇬", MY: "🇲🇾",
  VN: "🇻🇳", TH: "🇹🇭", PH: "🇵🇭", ID: "🇮🇩", NL: "🇳🇱", ES: "🇪🇸", IT: "🇮🇹", SE: "🇸🇪",
};

const DEVICE_ICONS: Record<string, typeof Monitor> = { desktop: Monitor, mobile: Smartphone, tablet: Tablet };

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState("30");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics?days=${days}`)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [days]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-teal" /></div>;
  if (!data) return <p className="text-center py-20 text-muted-foreground">Failed to load analytics</p>;

  const maxViews = Math.max(...data.topPages.map((p) => p.views), 1);
  const maxCountryViews = Math.max(...data.countries.map((c) => c.views), 1);
  const totalDevices = Object.values(data.devices).reduce((s, v) => s + v, 0) || 1;

  // Simple sparkline from time series
  const viewDays = Object.keys(data.timeSeries.viewsByDay).sort();
  const viewValues = viewDays.map((d) => data.timeSeries.viewsByDay[d] || 0);
  const maxDayViews = Math.max(...viewValues, 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="h-6 w-6 text-teal" /> Analytics</h1>
          <p className="text-muted-foreground text-sm">Page views, visitors, customer growth, and traffic by region</p>
        </div>
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="14">Last 14 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Eye className="h-5 w-5 text-teal mx-auto mb-1" />
            <p className="text-2xl font-bold">{data.today.pageViews.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Views Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 text-teal mx-auto mb-1" />
            <p className="text-2xl font-bold">{data.today.uniqueVisitors.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Visitors Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Eye className="h-5 w-5 text-navy mx-auto mb-1" />
            <p className="text-2xl font-bold">{data.totals.pageViews.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Views ({days}d)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 text-navy mx-auto mb-1" />
            <p className="text-2xl font-bold">{data.totals.uniqueVisitors.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Visitors ({days}d)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 text-gold mx-auto mb-1" />
            <p className="text-2xl font-bold">{data.totals.totalCustomers.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Mail className="h-5 w-5 text-gold mx-auto mb-1" />
            <p className="text-2xl font-bold">{data.totals.totalSubscribers.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Subscribers</p>
          </CardContent>
        </Card>
      </div>

      {/* Page Views Chart (simple bar chart) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2"><Eye className="h-4 w-4 text-teal" /> Page Views Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {viewDays.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No page view data yet. Views will appear after visitors browse the site.</p>
          ) : (
            <div className="flex items-end gap-[2px] h-32">
              {viewDays.map((day) => {
                const val = data.timeSeries.viewsByDay[day] || 0;
                const h = Math.max((val / maxDayViews) * 100, 2);
                const visitors = data.timeSeries.visitorsByDay[day] || 0;
                return (
                  <div key={day} className="flex-1 group relative" title={`${day}: ${val} views, ${visitors} visitors`}>
                    <div className="bg-teal/80 hover:bg-teal rounded-t-sm transition-colors" style={{ height: `${h}%` }} />
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-navy text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-10">
                      {day.slice(5)}: {val} views
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-teal" /> Top Pages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.topPages.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No data yet</p>
            ) : data.topPages.slice(0, 10).map((p) => (
              <div key={p.path} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium truncate max-w-[180px]">{p.path}</span>
                  <span className="text-muted-foreground shrink-0 ml-2">{p.views}</span>
                </div>
                <Progress value={(p.views / maxViews) * 100} className="h-1.5 [&>div]:bg-teal" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Countries */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2"><Globe className="h-4 w-4 text-teal" /> Visitors by Country</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.countries.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No geographic data yet (Cloudflare provides this automatically)</p>
            ) : data.countries.slice(0, 10).map((c) => (
              <div key={c.country} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{COUNTRY_FLAGS[c.country] || "🌍"} {c.country}</span>
                  <span className="text-muted-foreground">{c.views}</span>
                </div>
                <Progress value={(c.views / maxCountryViews) * 100} className="h-1.5 [&>div]:bg-navy-light" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Devices + Growth */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2"><Smartphone className="h-4 w-4 text-teal" /> Devices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.keys(data.devices).length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No data yet</p>
              ) : Object.entries(data.devices).map(([device, count]) => {
                const Icon = DEVICE_ICONS[device] || Monitor;
                const pct = ((count / totalDevices) * 100).toFixed(1);
                return (
                  <div key={device} className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="capitalize font-medium">{device}</span>
                        <span className="text-muted-foreground">{count} ({pct}%)</span>
                      </div>
                      <Progress value={parseFloat(pct)} className="h-1.5 [&>div]:bg-teal" />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-gold" /> Growth ({days}d)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">New Customers</span>
                <Badge className="bg-green-100 text-green-800 text-xs">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" /> +{data.totals.newCustomers}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">New Subscribers</span>
                <Badge className="bg-green-100 text-green-800 text-xs">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" /> +{data.totals.newSubscribers}
                </Badge>
              </div>
              {Object.entries(data.subscriberLanguages).length > 0 && (
                <>
                  <p className="text-xs text-muted-foreground mt-2">Subscriber Languages:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(data.subscriberLanguages).map(([lang, count]) => (
                      <Badge key={lang} variant="outline" className="text-[10px]">{lang}: {count}</Badge>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
