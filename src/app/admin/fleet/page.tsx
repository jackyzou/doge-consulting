"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users, AlertTriangle, CheckCircle, ChevronDown, ChevronRight,
  Calendar, FileText, MessageSquare, Loader2,
} from "lucide-react";

interface LogSummary {
  date: string;
  file: string;
  agents: string[];
  decisionCount: number;
  hasCeoItems: boolean;
  firstHeading: string;
  sizeKB: number;
}

interface Decision {
  date: string;
  text: string;
  status: string;
  owner: string;
}

export default function FleetPage() {
  const [logs, setLogs] = useState<LogSummary[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [logContents, setLogContents] = useState<Record<string, string>>({});
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/fleet")
      .then((r) => r.json())
      .then((data) => {
        setLogs(data.logs || []);
        setDecisions(data.decisions || []);
        setLogContents(data.logContents || {});
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-teal" />
      </div>
    );
  }

  const pendingDecisions = decisions.filter((d) => d.status === "NEEDS_CEO" || d.status === "CARRY_FORWARD");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Agent Fleet</h1>
        <p className="text-muted-foreground">Daily standup logs and pending decisions</p>
      </div>

      {/* Pending CEO Decisions */}
      {pendingDecisions.length > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Pending CEO Decisions ({pendingDecisions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingDecisions.map((d, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border border-red-200 bg-white p-3">
                  <Badge variant={d.status === "NEEDS_CEO" ? "destructive" : "secondary"} className="mt-0.5 shrink-0">
                    {d.status === "NEEDS_CEO" ? "Needs Decision" : "Carry Forward"}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{d.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">From standup: {d.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fleet Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-teal/10 p-2">
                <FileText className="h-5 w-5 text-teal" />
              </div>
              <div>
                <p className="text-2xl font-bold">{logs.length}</p>
                <p className="text-xs text-muted-foreground">Standup Logs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gold/10 p-2">
                <MessageSquare className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold">{decisions.length}</p>
                <p className="text-xs text-muted-foreground">Total Decisions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-100 p-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingDecisions.length}</p>
                <p className="text-xs text-muted-foreground">Pending CEO</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-100 p-2">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">6</p>
                <p className="text-xs text-muted-foreground">Active Agents</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Standup Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Standup Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No standup logs found. Run <code className="bg-muted px-1 rounded">node agents/run-fleet.mjs</code> to generate.
            </p>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.date} className="rounded-lg border">
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-4 h-auto"
                    onClick={() => setExpandedLog(expandedLog === log.date ? null : log.date)}
                  >
                    <div className="flex items-center gap-3 text-left">
                      {expandedLog === log.date ? (
                        <ChevronDown className="h-4 w-4 shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 shrink-0" />
                      )}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">{log.date}</span>
                          {log.hasCeoItems && (
                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                              CEO Action
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {log.decisionCount} decisions
                          </Badge>
                          <span className="text-xs text-muted-foreground">{log.sizeKB} KB</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          {log.agents.map((a) => (
                            <span
                              key={a}
                              className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full"
                            >
                              {a}
                            </span>
                          ))}
                          {log.firstHeading && (
                            <span className="text-xs text-muted-foreground ml-1">
                              — {log.firstHeading}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Button>

                  {expandedLog === log.date && logContents[log.date] && (
                    <div className="border-t">
                      <ScrollArea className="h-[500px]">
                        <div className="p-4">
                          <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed text-foreground/90">
                            {logContents[log.date]}
                          </pre>
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Decisions Log */}
      {decisions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              All Decisions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium text-muted-foreground">Date</th>
                    <th className="pb-2 font-medium text-muted-foreground">Decision</th>
                    <th className="pb-2 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {decisions.map((d, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 pr-3 text-muted-foreground whitespace-nowrap">{d.date}</td>
                      <td className="py-2 pr-3">{d.text}</td>
                      <td className="py-2">
                        <Badge
                          variant={
                            d.status === "NEEDS_CEO"
                              ? "destructive"
                              : d.status === "APPROVED"
                                ? "default"
                                : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {d.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
