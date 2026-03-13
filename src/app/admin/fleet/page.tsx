"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Users, AlertTriangle, CheckCircle, ChevronDown, ChevronRight,
  Calendar, FileText, Loader2, Bot, Plus, Check, X, Clock,
  MessageSquare, Send, Archive, ArrowRight, Star, Sparkles,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────
interface Agent { id: string; name: string; role: string; avatar: string; color: string; skills: string[]; bio: string; decisionCount: number; }
interface Decision { id: string; agent: string; type: string; priority: string; title: string; content: string; status: string; assignedTo: string | null; tags: string | null; createdAt: string; updatedAt: string; }
interface LogSummary { date: string; agents: string[]; decisionCount: number; hasCeoItems: boolean; sizeKB: number; content: string; }

const priorityConfig: Record<string, { label: string; color: string; dot: string }> = {
  critical: { label: "Critical", color: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
  high: { label: "High", color: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  normal: { label: "Normal", color: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  low: { label: "Low", color: "bg-slate-50 text-slate-600 border-slate-200", dot: "bg-slate-400" },
};

// ── Markdown renderer for standup logs ──────────────────
function renderStandupMd(md: string): string {
  return md
    .replace(/^#### (.+)$/gm, '<h4 class="text-base font-semibold text-navy mt-6 mb-2 pb-1 border-b">$1</h4>')
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-navy mt-8 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-navy mt-10 mb-4 pb-2 border-b-2 border-teal/30"><span class="text-teal mr-2">▎</span>$1</h2>')
    .replace(/^---$/gm, '<hr class="my-6 border-border/50" />')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em class="text-muted-foreground">$1</em>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-3 border-teal/40 pl-3 py-1 my-2 text-sm text-muted-foreground italic bg-teal/5 rounded-r">$1</blockquote>')
    .replace(/^- \[x\] (.+)$/gm, '<div class="flex items-center gap-2 py-0.5 text-sm"><span class="text-emerald-500">✓</span><span class="line-through text-muted-foreground">$1</span></div>')
    .replace(/^- \[ \] (.+)$/gm, '<div class="flex items-center gap-2 py-0.5 text-sm"><span class="text-muted-foreground">○</span><span>$1</span></div>')
    .replace(/^- (.+)$/gm, '<div class="flex items-start gap-2 py-0.5 text-sm ml-2"><span class="text-teal mt-1.5 text-[8px]">●</span><span>$1</span></div>')
    .replace(/^\| (.+) \|$/gm, (match) => {
      const cells = match.split("|").filter(Boolean).map(c => c.trim());
      if (cells.every(c => /^[-:]+$/.test(c))) return "";
      return '<tr>' + cells.map(c => `<td class="px-3 py-1.5 text-sm border-b border-border/30">${c}</td>`).join("") + '</tr>';
    })
    .replace(/(<tr>.*<\/tr>\n?)+/g, (block) => `<table class="w-full border-collapse my-4 rounded-lg overflow-hidden border border-border/30">${block}</table>`)
    .replace(/🔴/g, '<span class="inline-block w-2.5 h-2.5 rounded-full bg-red-500 mr-1"></span>')
    .replace(/🟡/g, '<span class="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 mr-1"></span>')
    .replace(/🟢/g, '<span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1"></span>')
    .replace(/🔵/g, '<span class="inline-block w-2.5 h-2.5 rounded-full bg-blue-500 mr-1"></span>')
    .replace(/\[DECISION\]/g, '<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 mr-1">DECISION</span>')
    .replace(/NEEDS_CEO/g, '<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">NEEDS CEO</span>')
    .replace(/APPROVED/g, '<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">APPROVED</span>')
    .replace(/BLOCKED/g, '<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 animate-pulse">BLOCKED</span>')
    .replace(/\n\n/g, '<br/><br/>');
}

export default function FleetPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [logs, setLogs] = useState<LogSummary[]>([]);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"decisions" | "agents" | "standups">("decisions");

  // Decision detail
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [feedback, setFeedback] = useState("");
  const [savingFeedback, setSavingFeedback] = useState(false);

  // New decision input
  const [showNewDecision, setShowNewDecision] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [newPriority, setNewPriority] = useState("normal");
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [adding, setAdding] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Agent detail
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // Archive view
  const [showArchive, setShowArchive] = useState(false);

  const fetchData = useCallback(() => {
    fetch("/api/admin/fleet")
      .then((r) => r.json())
      .then((data) => { setAgents(data.agents || []); setDecisions(data.decisions || []); setLogs(data.logs || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateDecision = async (id: string, status: string, extraContent?: string) => {
    const decision = decisions.find(d => d.id === id);
    const newContent = extraContent ? `${decision?.content || ""}\n\n---\n**CEO Feedback (${new Date().toLocaleDateString()}):** ${extraContent}` : undefined;
    await fetch("/api/admin/fleet", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, ...(newContent && { content: newContent }) }),
    });
    setSelectedDecision(null);
    setFeedback("");
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
        priority: newPriority,
        title: newTitle.trim(),
        content: newContent.trim(),
        status: "open",
        assignedTo: newAssignee || null,
        tags: newAssignee ? `@${newAssignee}` : null,
      }),
    });
    setNewTitle(""); setNewContent(""); setNewAssignee(""); setNewPriority("normal");
    setShowNewDecision(false); setAdding(false);
    fetchData();
  };

  const handleContentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const val = newContent;
    const pos = contentRef.current?.selectionStart || 0;
    const lastAt = val.lastIndexOf("@", pos);
    if (e.key === "@" || (lastAt >= 0 && pos - lastAt <= 10 && !val.substring(lastAt, pos).includes(" "))) {
      setShowMentionDropdown(true);
    } else {
      setShowMentionDropdown(false);
    }
  };

  const insertMention = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent || !contentRef.current) return;
    const pos = contentRef.current.selectionStart || newContent.length;
    const before = newContent.substring(0, pos).replace(/@\w*$/, "");
    const after = newContent.substring(pos);
    setNewContent(`${before}@${agent.name} ${after}`);
    setNewAssignee(agentId);
    setShowMentionDropdown(false);
    contentRef.current.focus();
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-teal" /></div>;

  const openDecisions = decisions.filter(d => d.status === "open" || d.status === "escalated");
  const inProgressDecisions = decisions.filter(d => d.status === "in_progress");
  const completedDecisions = decisions.filter(d => d.status === "completed");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Agent Fleet</h1>
          <p className="text-muted-foreground">Team roster, decisions, and standup logs</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border bg-muted/50 p-1">
            {(["decisions", "agents", "standups"] as const).map((t) => (
              <Button key={t} variant={tab === t ? "default" : "ghost"} size="sm" onClick={() => setTab(t)} className="capitalize">{t}</Button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className={openDecisions.length > 0 ? "border-amber-200 bg-amber-50/30" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${openDecisions.length > 0 ? "bg-amber-100" : "bg-red-100"}`}>
                <AlertTriangle className={`h-5 w-5 ${openDecisions.length > 0 ? "text-amber-600" : "text-red-500"}`} />
              </div>
              <div><p className="text-2xl font-bold">{openDecisions.length}</p><p className="text-xs text-muted-foreground">Open</p></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2"><Clock className="h-5 w-5 text-blue-600" /></div>
              <div><p className="text-2xl font-bold">{inProgressDecisions.length}</p><p className="text-xs text-muted-foreground">In Progress</p></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-100 p-2"><CheckCircle className="h-5 w-5 text-emerald-600" /></div>
              <div><p className="text-2xl font-bold">{completedDecisions.length}</p><p className="text-xs text-muted-foreground">Resolved</p></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-teal/10 p-2"><Bot className="h-5 w-5 text-teal" /></div>
              <div><p className="text-2xl font-bold">{agents.length}</p><p className="text-xs text-muted-foreground">Agents</p></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ═══ DECISIONS TAB ═══ */}
      {tab === "decisions" && (
        <div className="space-y-4">
          {/* Add new decision button */}
          <div className="flex gap-2">
            <Button onClick={() => setShowNewDecision(true)} className="bg-navy hover:bg-navy/90">
              <Plus className="h-4 w-4 mr-2" /> New Decision / Task
            </Button>
            <Button variant="outline" onClick={() => setShowArchive(!showArchive)}>
              <Archive className="h-4 w-4 mr-2" /> {showArchive ? "Hide" : "Show"} Archive ({completedDecisions.length})
            </Button>
          </div>

          {/* Open decisions */}
          {openDecisions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Needs Attention</h3>
              {openDecisions.map((d) => {
                const p = priorityConfig[d.priority] || priorityConfig.normal;
                const agent = agents.find(a => a.id === d.agent);
                return (
                  <Card key={d.id} className={`border-l-4 hover:shadow-md transition-shadow cursor-pointer ${d.priority === "critical" ? "border-l-red-500" : d.priority === "high" ? "border-l-amber-500" : "border-l-blue-500"}`}
                    onClick={() => { setSelectedDecision(d); setFeedback(""); }}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <Badge className={`${p.color} border text-[10px] px-1.5`}>{p.label}</Badge>
                            {d.assignedTo && (
                              <Badge variant="outline" className="text-[10px] px-1.5">→ {d.assignedTo}</Badge>
                            )}
                          </div>
                          <h4 className="font-semibold text-sm leading-snug">{d.title}</h4>
                          {d.content && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{d.content.split("\n---")[0]}</p>}
                          <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                            {agent && (
                              <span className="flex items-center gap-1">
                                <span className="w-4 h-4 rounded-full text-[8px] text-white flex items-center justify-center font-bold" style={{ background: agent.color }}>{agent.avatar[0]}</span>
                                {agent.name}
                              </span>
                            )}
                            <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-50" onClick={() => updateDecision(d.id, "completed")} title="Approve">
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50" onClick={() => updateDecision(d.id, "in_progress")} title="In Progress">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* In progress */}
          {inProgressDecisions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">In Progress</h3>
              {inProgressDecisions.map((d) => {
                const agent = agents.find(a => a.id === d.agent);
                return (
                  <Card key={d.id} className="border-l-4 border-l-blue-400 hover:shadow-md transition-shadow cursor-pointer opacity-80"
                    onClick={() => { setSelectedDecision(d); setFeedback(""); }}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                          <div>
                            <h4 className="font-medium text-sm">{d.title}</h4>
                            <span className="text-[11px] text-muted-foreground">{agent?.name} · {new Date(d.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="h-8 text-emerald-600" onClick={(e) => { e.stopPropagation(); updateDecision(d.id, "completed"); }}>
                          <Check className="h-3.5 w-3.5 mr-1" /> Done
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {openDecisions.length === 0 && inProgressDecisions.length === 0 && (
            <Card><CardContent className="py-12 text-center">
              <Sparkles className="h-12 w-12 text-teal/40 mx-auto mb-3" />
              <p className="text-lg font-medium">All clear!</p>
              <p className="text-sm text-muted-foreground">No pending decisions.</p>
            </CardContent></Card>
          )}

          {/* Archive */}
          {showArchive && completedDecisions.length > 0 && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><Archive className="h-4 w-4" /> Resolved ({completedDecisions.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  {completedDecisions.slice(0, 30).map((d) => (
                    <div key={d.id} className="flex items-center gap-2 py-1.5 text-sm cursor-pointer hover:bg-muted/50 rounded px-2 -mx-2"
                      onClick={() => { setSelectedDecision(d); setFeedback(""); }}>
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span className="line-through text-muted-foreground flex-1 truncate">{d.title}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">{d.agent} · {new Date(d.createdAt).toLocaleDateString()}</span>
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
            <Card key={agent.id} className="hover:shadow-lg transition-all cursor-pointer group hover:border-teal/40"
              onClick={() => setSelectedAgent(agent)}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-full h-12 w-12 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md" style={{ background: agent.color }}>
                    {agent.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-navy group-hover:text-teal transition-colors">{agent.name}</h3>
                    <p className="text-sm text-teal font-medium">{agent.role}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{agent.bio}</p>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {agent.skills.slice(0, 4).map((s) => (
                        <span key={s} className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full">{s}</span>
                      ))}
                      {agent.skills.length > 4 && <span className="text-[10px] text-muted-foreground">+{agent.skills.length - 4}</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {agent.decisionCount} decisions</span>
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
        <div className="space-y-3">
          {logs.length === 0 ? (
            <Card><CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No standup logs yet. Run <code className="bg-muted px-1.5 py-0.5 rounded text-xs">node agents/run-fleet.mjs</code> then sync.</p>
            </CardContent></Card>
          ) : logs.map((log) => (
            <Card key={log.date} className="overflow-hidden">
              <button className="w-full text-left p-4 hover:bg-muted/30 transition-colors flex items-center gap-3"
                onClick={() => setExpandedLog(expandedLog === log.date ? null : log.date)}>
                {expandedLog === log.date ? <ChevronDown className="h-4 w-4 shrink-0 text-teal" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{log.date}</span>
                    {log.hasCeoItems && <Badge variant="destructive" className="text-[10px] px-1.5 py-0 animate-pulse">CEO Action</Badge>}
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{log.decisionCount} decisions</Badge>
                    <span className="text-xs text-muted-foreground">{log.sizeKB} KB</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {log.agents.map((a) => <span key={a} className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full">{a}</span>)}
                  </div>
                </div>
              </button>
              {expandedLog === log.date && (
                <div className="border-t bg-white">
                  <ScrollArea className="h-[600px]">
                    <div className="p-6 prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: renderStandupMd(log.content) }} />
                  </ScrollArea>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* ═══ DECISION DETAIL DIALOG ═══ */}
      <Dialog open={!!selectedDecision} onOpenChange={() => setSelectedDecision(null)}>
        <DialogContent className="max-w-lg">
          {selectedDecision && (() => {
            const agent = agents.find(a => a.id === selectedDecision.agent);
            const p = priorityConfig[selectedDecision.priority] || priorityConfig.normal;
            return (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`${p.color} border`}>{p.label}</Badge>
                    <Badge variant="outline">{selectedDecision.status}</Badge>
                  </div>
                  <DialogTitle className="text-lg leading-snug">{selectedDecision.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Agent info */}
                  {agent && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center" style={{ background: agent.color }}>{agent.avatar}</div>
                      <div>
                        <p className="text-sm font-medium">{agent.name}</p>
                        <p className="text-xs text-muted-foreground">{agent.role} · {new Date(selectedDecision.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                  {/* Content */}
                  {selectedDecision.content && (
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap bg-slate-50 p-4 rounded-lg border max-h-60 overflow-y-auto">
                      {selectedDecision.content}
                    </div>
                  )}
                  {selectedDecision.assignedTo && (
                    <div className="text-sm"><span className="text-muted-foreground">Assigned to:</span> <strong>{selectedDecision.assignedTo}</strong></div>
                  )}
                  {/* Feedback input */}
                  {selectedDecision.status !== "completed" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Your Feedback</label>
                      <textarea className="w-full rounded-lg border p-3 text-sm min-h-[80px] resize-none focus:ring-2 focus:ring-teal/50 focus:border-teal"
                        placeholder="Add feedback, comments, or instructions..."
                        value={feedback} onChange={e => setFeedback(e.target.value)} />
                    </div>
                  )}
                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    {selectedDecision.status !== "completed" && (
                      <>
                        <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" disabled={savingFeedback}
                          onClick={async () => { setSavingFeedback(true); await updateDecision(selectedDecision.id, "completed", feedback || undefined); setSavingFeedback(false); }}>
                          <Check className="h-4 w-4 mr-2" /> Approve
                        </Button>
                        <Button variant="outline" className="flex-1" disabled={savingFeedback}
                          onClick={async () => { setSavingFeedback(true); await updateDecision(selectedDecision.id, "in_progress", feedback || undefined); setSavingFeedback(false); }}>
                          <ArrowRight className="h-4 w-4 mr-2" /> In Progress
                        </Button>
                        {feedback && (
                          <Button variant="outline" disabled={savingFeedback}
                            onClick={async () => { setSavingFeedback(true); await updateDecision(selectedDecision.id, selectedDecision.status, feedback); setSavingFeedback(false); }}>
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    )}
                    {selectedDecision.status === "completed" && (
                      <Button variant="outline" className="flex-1" onClick={() => updateDecision(selectedDecision.id, "open")}>
                        Reopen
                      </Button>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ═══ NEW DECISION DIALOG ═══ */}
      <Dialog open={showNewDecision} onOpenChange={setShowNewDecision}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New Decision / Task</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Title</label>
              <Input placeholder="What needs to be decided or done?" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
            </div>
            <div className="relative">
              <label className="text-sm font-medium mb-1 block">Details <span className="text-muted-foreground font-normal">(type @ to mention an agent)</span></label>
              <textarea ref={contentRef} className="w-full rounded-lg border p-3 text-sm min-h-[120px] resize-none focus:ring-2 focus:ring-teal/50 focus:border-teal"
                placeholder="Describe the task, add context, @mention agents..."
                value={newContent} onChange={e => setNewContent(e.target.value)} onKeyUp={handleContentKeyDown} />
              {showMentionDropdown && (
                <div className="absolute bottom-0 left-0 bg-white border rounded-lg shadow-lg z-50 w-64 max-h-48 overflow-y-auto">
                  {agents.map(a => (
                    <button key={a.id} className="w-full text-left px-3 py-2 hover:bg-muted/50 flex items-center gap-2 text-sm"
                      onClick={() => insertMention(a.id)}>
                      <span className="w-6 h-6 rounded-full text-white text-[10px] font-bold flex items-center justify-center" style={{ background: a.color }}>{a.avatar[0]}</span>
                      <div><p className="font-medium">{a.name}</p><p className="text-[10px] text-muted-foreground">{a.role}</p></div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Priority</label>
                <select className="w-full rounded-lg border p-2 text-sm" value={newPriority} onChange={e => setNewPriority(e.target.value)}>
                  <option value="critical">🔴 Critical</option>
                  <option value="high">🟡 High</option>
                  <option value="normal">🔵 Normal</option>
                  <option value="low">⚪ Low</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Assign to</label>
                <select className="w-full rounded-lg border p-2 text-sm" value={newAssignee} onChange={e => setNewAssignee(e.target.value)}>
                  <option value="">Unassigned</option>
                  {agents.map(a => <option key={a.id} value={a.id}>{a.name} ({a.role})</option>)}
                </select>
              </div>
            </div>
            <Button className="w-full bg-navy hover:bg-navy/90" onClick={addDecision} disabled={adding || !newTitle.trim()}>
              <Plus className="h-4 w-4 mr-2" /> Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ AGENT DETAIL DIALOG ═══ */}
      <Dialog open={!!selectedAgent} onOpenChange={() => setSelectedAgent(null)}>
        <DialogContent className="max-w-md">
          {selectedAgent && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full text-white text-lg font-bold flex items-center justify-center shadow-lg" style={{ background: selectedAgent.color }}>
                    {selectedAgent.avatar}
                  </div>
                  <div>
                    <DialogTitle>{selectedAgent.name}</DialogTitle>
                    <p className="text-sm text-teal font-medium">{selectedAgent.role}</p>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedAgent.bio}</p>
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><Star className="h-4 w-4 text-gold" /> Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAgent.skills.map(s => (
                      <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
                  <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {selectedAgent.decisionCount} decisions</span>
                  <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> Active</span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
