"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Users, AlertTriangle, CheckCircle, ChevronDown, ChevronRight,
  Calendar, FileText, MessageSquare, Loader2, Bot, Plus, Check, X, Clock,
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  role: string;
  skills: string[];
}

interface Decision {
  id: string;
  agent: string;
  type: string;
  priority: string;
  title: string;
  content: string;
  status: string;
  assignedTo: string | null;
  createdAt: string;
}

interface LogSummary {
  date: string;
  agents: string[];
  decisionCount: number;
  hasCeoItems: boolean;
  sizeKB: number;
  content: string;
}

const priorityColors: Record<string, string> = {
  critical: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  normal: "bg-blue-100 text-blue-700",
  low: "bg-slate-100 text-slate-600",
};

const statusIcons: Record<string, React.ReactNode> = {
  open: <Clock className="h-3.5 w-3.5" />,
  in_progress: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
  completed: <Check className="h-3.5 w-3.5" />,
  escalated: <AlertTriangle className="h-3.5 w-3.5" />,
};

export default function FleetPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [logs, setLogs] = useState<LogSummary[]>([]);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"decisions" | "agents" | "standups">("decisions");
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchData = useCallback(() => {
    fetch("/api/admin/fleet")
      .then((r) => r.json())
      .then((data) => {
        setAgents(data.agents || []);
        setDecisions(data.decisions || []);
        setLogs(data.logs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateDecision = async (id: string, status: string) => {
    await fetch("/api/admin/fleet", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchData();
  };

  const addDecision = async () => {
    if (!newTitle.trim()) return;
    setAdding(true);
    await fetch("/api/admin/fleet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agent: "jacky",
        type: "decision",
        priority: "high",
        title: newTitle.trim(),
        status: "open",
        assignedTo: "jacky",
      }),
    });
    setNewTitle("");
    setAdding(false);
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-teal" />
      </div>
    );
  }

  const openDecisions = decisions.filter((d) => d.status === "open" || d.status === "escalated");
  const closedDecisions = decisions.filter((d) => d.status === "completed");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Agent Fleet</h1>
          <p className="text-muted-foreground">Team roster, decisions, and standup logs</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border bg-muted/50 p-1">
          {(["decisions", "agents", "standups"] as const).map((t) => (
            <Button
              key={t}
              variant={tab === t ? "default" : "ghost"}
              size="sm"
              onClick={() => setTab(t)}
              className="capitalize"
            >
              {t}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-100 p-2"><AlertTriangle className="h-5 w-5 text-red-500" /></div>
              <div>
                <p className="text-2xl font-bold">{openDecisions.length}</p>
                <p className="text-xs text-muted-foreground">Open Decisions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-100 p-2"><CheckCircle className="h-5 w-5 text-emerald-600" /></div>
              <div>
                <p className="text-2xl font-bold">{closedDecisions.length}</p>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-teal/10 p-2"><FileText className="h-5 w-5 text-teal" /></div>
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
              <div className="rounded-lg bg-gold/10 p-2"><Bot className="h-5 w-5 text-gold" /></div>
              <div>
                <p className="text-2xl font-bold">{agents.length}</p>
                <p className="text-xs text-muted-foreground">Active Agents</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ═══ DECISIONS TAB ═══ */}
      {tab === "decisions" && (
        <div className="space-y-4">
          {/* Add new decision */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a decision item for CEO review..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addDecision()}
                />
                <Button onClick={addDecision} disabled={adding || !newTitle.trim()}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Open decisions */}
          {openDecisions.length > 0 && (
            <Card className="border-amber-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-amber-700">
                  <AlertTriangle className="h-5 w-5" />
                  Pending Decisions ({openDecisions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {openDecisions.map((d) => (
                    <div key={d.id} className="flex items-center gap-3 rounded-lg border p-3 bg-white">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`${priorityColors[d.priority] || priorityColors.normal} text-[10px]`}>
                            {d.priority}
                          </Badge>
                          <span className="text-sm font-medium">{d.title}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>From: {d.agent}</span>
                          {d.assignedTo && <span>→ {d.assignedTo}</span>}
                          <span>·</span>
                          <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                        </div>
                        {d.content && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{d.content}</p>}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button size="sm" variant="outline" className="h-8 text-emerald-600 hover:bg-emerald-50"
                          onClick={() => updateDecision(d.id, "completed")}>
                          <Check className="h-3.5 w-3.5 mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 text-red-500 hover:bg-red-50"
                          onClick={() => updateDecision(d.id, "completed")}>
                          <X className="h-3.5 w-3.5 mr-1" /> Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {openDecisions.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-lg font-medium">All clear!</p>
                <p className="text-sm text-muted-foreground">No pending decisions. Add one above or run a fleet standup.</p>
              </CardContent>
            </Card>
          )}

          {/* Resolved decisions */}
          {closedDecisions.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Resolved ({closedDecisions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {closedDecisions.slice(0, 20).map((d) => (
                    <div key={d.id} className="flex items-center gap-2 py-1.5 text-sm text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span className="line-through">{d.title}</span>
                      <span className="text-xs">· {d.agent} · {new Date(d.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ═══ AGENTS TAB ═══ */}
      {tab === "agents" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <Card key={agent.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-navy/10 h-10 w-10 flex items-center justify-center text-navy font-bold text-sm shrink-0">
                    {agent.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-navy">{agent.name}</h3>
                    <p className="text-sm text-teal font-medium">{agent.role}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {agent.skills.map((s) => (
                        <span key={s} className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ═══ STANDUPS TAB ═══ */}
      {tab === "standups" && (
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
                No standup logs found. Run <code className="bg-muted px-1.5 py-0.5 rounded text-xs">node agents/run-fleet.mjs</code> to generate.
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
                        {expandedLog === log.date ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold">{log.date}</span>
                            {log.hasCeoItems && (
                              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">CEO Action</Badge>
                            )}
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {log.decisionCount} decisions
                            </Badge>
                            <span className="text-xs text-muted-foreground">{log.sizeKB} KB</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            {log.agents.map((a) => (
                              <span key={a} className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full">{a}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Button>
                    {expandedLog === log.date && (
                      <div className="border-t">
                        <ScrollArea className="h-[500px]">
                          <div className="p-4">
                            <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed text-foreground/90">{log.content}</pre>
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
      )}
    </div>
  );
}
