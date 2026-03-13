"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Users, AlertTriangle, CheckCircle, ChevronDown, ChevronRight,
  Calendar, FileText, Loader2, Bot, Plus, Check, Clock,
  Send, Archive, ArrowRight, Star, Sparkles, BookOpen,
  Activity, Circle,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────
interface Agent { id: string; name: string; role: string; avatar: string; color: string; skills: string[]; bio: string; decisionCount: number; }
interface Decision { id: string; agent: string; type: string; priority: string; title: string; content: string; status: string; assignedTo: string | null; tags: string | null; createdAt: string; updatedAt: string; }
interface LogSummary { date: string; agents: string[]; decisionCount: number; hasCeoItems: boolean; sizeKB: number; content: string; }
interface TimelineItem { id: string; agent: string; type: string; title: string; status: string; priority: string; createdAt: string; }
interface CocSection { title: string; content: string; }

const priorityConfig: Record<string, { label: string; color: string; border: string }> = {
  critical: { label: "Critical", color: "bg-red-50 text-red-700 border-red-200", border: "border-l-red-500" },
  high: { label: "High", color: "bg-orange-50 text-orange-700 border-orange-200", border: "border-l-amber-500" },
  normal: { label: "Normal", color: "bg-blue-50 text-blue-700 border-blue-200", border: "border-l-blue-400" },
  low: { label: "Low", color: "bg-slate-50 text-slate-600 border-slate-200", border: "border-l-slate-300" },
};

const agentColors: Record<string, string> = { alex: "#0F2B46", amy: "#059669", seth: "#2563EB", rachel: "#D97706", seto: "#7C3AED", tiffany: "#EC4899", jacky: "#2EC4B6" };
const typeIcons: Record<string, string> = { decision: "📋", standup: "🌅", action: "⚡", alert: "🚨", note: "📝" };

export default function OperationsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [logs, setLogs] = useState<LogSummary[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [cocSections, setCocSections] = useState<CocSection[]>([]);
  const [cocUpdated, setCocUpdated] = useState("");
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "decisions" | "agents" | "standups" | "playbook">("overview");
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [feedback, setFeedback] = useState("");
  const [showNewDecision, setShowNewDecision] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [newPriority, setNewPriority] = useState("normal");
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showArchive, setShowArchive] = useState(false);
  const [expandedCocSection, setExpandedCocSection] = useState<number | null>(0);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const fetchData = useCallback(() => {
    fetch("/api/admin/fleet")
      .then(r => r.json())
      .then(data => {
        setAgents(data.agents || []);
        setDecisions(data.decisions || []);
        setLogs(data.logs || []);
        setTimeline(data.timeline || []);
        if (data.coc) { setCocSections(data.coc.sections || []); setCocUpdated(data.coc.updatedAt || ""); }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateDecision = async (id: string, status: string, extra?: string) => {
    const d = decisions.find(x => x.id === id);
    const newContent = extra ? `${d?.content || ""}\n\n---\n**CEO Feedback (${new Date().toLocaleDateString()}):** ${extra}` : undefined;
    await fetch("/api/admin/fleet", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status, ...(newContent && { content: newContent }) }) });
    setSelectedDecision(null); setFeedback(""); fetchData();
  };

  const addDecision = async () => {
    if (!newTitle.trim()) return;
    setAdding(true);
    await fetch("/api/admin/fleet", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ agent: "jacky", type: "decision", priority: newPriority, title: newTitle.trim(), content: newContent.trim(), status: "open", assignedTo: newAssignee || null, tags: newAssignee ? `@${newAssignee}` : null }) });
    setNewTitle(""); setNewContent(""); setNewAssignee(""); setNewPriority("normal"); setShowNewDecision(false); setAdding(false); fetchData();
  };

  const insertMention = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent || !contentRef.current) return;
    const pos = contentRef.current.selectionStart || newContent.length;
    const before = newContent.substring(0, pos).replace(/@\w*$/, "");
    setNewContent(`${before}@${agent.name} ${newContent.substring(pos)}`);
    setNewAssignee(agentId); setShowMentionDropdown(false); contentRef.current.focus();
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-teal" /></div>;

  const openDecisions = decisions.filter(d => d.status === "open" || d.status === "escalated");
  const inProgressDecisions = decisions.filter(d => d.status === "in_progress");
  const completedDecisions = decisions.filter(d => d.status === "completed");

  // Group timeline by date
  const timelineByDate: Record<string, TimelineItem[]> = {};
  for (const item of timeline) {
    const date = new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (!timelineByDate[date]) timelineByDate[date] = [];
    timelineByDate[date].push(item);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Operations</h1>
          <p className="text-muted-foreground text-sm">Agent fleet, decisions, standups & playbook</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border bg-muted/50 p-1 overflow-x-auto">
          {(["overview", "decisions", "agents", "standups", "playbook"] as const).map(t => (
            <Button key={t} variant={tab === t ? "default" : "ghost"} size="sm" onClick={() => setTab(t)} className="capitalize text-xs sm:text-sm whitespace-nowrap">{t}</Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <Card className={openDecisions.length > 0 ? "border-amber-200 bg-amber-50/30" : ""}>
          <CardContent className="pt-5 pb-4"><div className="flex items-center gap-3"><div className={`rounded-lg p-2 ${openDecisions.length > 0 ? "bg-amber-100" : "bg-slate-100"}`}><AlertTriangle className={`h-4 w-4 ${openDecisions.length > 0 ? "text-amber-600" : "text-slate-400"}`} /></div><div><p className="text-xl font-bold">{openDecisions.length}</p><p className="text-[11px] text-muted-foreground">Open</p></div></div></CardContent>
        </Card>
        <Card><CardContent className="pt-5 pb-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-blue-100 p-2"><Clock className="h-4 w-4 text-blue-600" /></div><div><p className="text-xl font-bold">{inProgressDecisions.length}</p><p className="text-[11px] text-muted-foreground">In Progress</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-5 pb-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-emerald-100 p-2"><CheckCircle className="h-4 w-4 text-emerald-600" /></div><div><p className="text-xl font-bold">{completedDecisions.length}</p><p className="text-[11px] text-muted-foreground">Resolved</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-5 pb-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-teal/10 p-2"><Bot className="h-4 w-4 text-teal" /></div><div><p className="text-xl font-bold">{agents.length}</p><p className="text-[11px] text-muted-foreground">Agents</p></div></div></CardContent></Card>
      </div>

      {/* ═══ OVERVIEW TAB ═══ */}
      {tab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Activity Timeline */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4 text-teal" /> Activity Timeline</CardTitle></CardHeader>
              <CardContent>
                {Object.keys(timelineByDate).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No activity yet. Run a fleet standup to begin.</p>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(timelineByDate).slice(0, 5).map(([date, items]) => (
                      <div key={date}>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="h-px flex-1 bg-border" />
                          <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{date}</span>
                          <div className="h-px flex-1 bg-border" />
                        </div>
                        <div className="space-y-2 ml-4 border-l-2 border-border/50 pl-4">
                          {items.map(item => (
                            <div key={item.id} className="flex items-start gap-3 group">
                              <div className="mt-1 -ml-[21px] w-3 h-3 rounded-full border-2 border-white shrink-0" style={{ background: agentColors[item.agent] || "#94a3b8" }} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs">{typeIcons[item.type] || "📄"}</span>
                                  <span className="text-sm font-medium truncate">{item.title}</span>
                                  <Badge variant={item.status === "completed" ? "default" : item.status === "open" ? "destructive" : "secondary"} className="text-[9px] px-1 py-0">{item.status}</Badge>
                                </div>
                                <p className="text-[11px] text-muted-foreground">{item.agent} · {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions + Agent Roster */}
          <div className="space-y-4">
            {openDecisions.length > 0 && (
              <Card className="border-amber-200 bg-amber-50/30">
                <CardHeader className="pb-2"><CardTitle className="text-sm text-amber-700 flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Needs Attention</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {openDecisions.slice(0, 3).map(d => (
                    <button key={d.id} className="w-full text-left p-2 rounded-lg hover:bg-amber-100/50 transition-colors" onClick={() => { setTab("decisions"); setSelectedDecision(d); }}>
                      <p className="text-sm font-medium truncate">{d.title}</p>
                      <p className="text-[10px] text-muted-foreground">{d.agent} · {new Date(d.createdAt).toLocaleDateString()}</p>
                    </button>
                  ))}
                  {openDecisions.length > 3 && <button className="text-xs text-amber-700 font-medium" onClick={() => setTab("decisions")}>+{openDecisions.length - 3} more →</button>}
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4 text-teal" /> Team</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {agents.map(a => (
                    <button key={a.id} className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/50 hover:bg-muted transition-colors" onClick={() => setSelectedAgent(a)}>
                      <div className="w-5 h-5 rounded-full text-[9px] text-white font-bold flex items-center justify-center" style={{ background: a.color }}>{a.avatar[0]}</div>
                      <span className="text-xs font-medium">{a.name.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-teal" /> Recent Standups</CardTitle></CardHeader>
              <CardContent>
                {logs.slice(0, 3).map(log => (
                  <button key={log.date} className="w-full text-left p-2 rounded-lg hover:bg-muted/50 transition-colors flex items-center justify-between" onClick={() => { setTab("standups"); setExpandedLog(log.date); }}>
                    <div><p className="text-sm font-medium">{log.date}</p><p className="text-[10px] text-muted-foreground">{log.agents.join(", ")}</p></div>
                    {log.hasCeoItems && <Circle className="h-2 w-2 fill-red-500 text-red-500" />}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ═══ DECISIONS TAB ═══ */}
      {tab === "decisions" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={() => setShowNewDecision(true)} className="bg-navy hover:bg-navy/90"><Plus className="h-4 w-4 mr-2" /> New Task</Button>
            <Button variant="outline" onClick={() => setShowArchive(!showArchive)}><Archive className="h-4 w-4 mr-2" /> Archive ({completedDecisions.length})</Button>
          </div>
          {openDecisions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Needs Attention</h3>
              {openDecisions.map(d => { const p = priorityConfig[d.priority] || priorityConfig.normal; const agent = agents.find(a => a.id === d.agent); return (
                <Card key={d.id} className={`border-l-4 ${p.border} hover:shadow-md transition-shadow cursor-pointer`} onClick={() => { setSelectedDecision(d); setFeedback(""); }}>
                  <CardContent className="p-3 sm:p-4"><div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1"><Badge className={`${p.color} border text-[10px] px-1.5`}>{p.label}</Badge>{d.assignedTo && <Badge variant="outline" className="text-[10px]">→ {d.assignedTo}</Badge>}</div>
                      <h4 className="font-semibold text-sm leading-snug">{d.title}</h4>
                      {d.content && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{d.content.split("\n---")[0]}</p>}
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                        {agent && <span className="flex items-center gap-1"><span className="w-4 h-4 rounded-full text-[8px] text-white flex items-center justify-center font-bold" style={{ background: agent.color }}>{agent.avatar[0]}</span>{agent.name}</span>}
                        <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-50" onClick={() => updateDecision(d.id, "completed")} title="Approve"><Check className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50" onClick={() => updateDecision(d.id, "in_progress")} title="In Progress"><ArrowRight className="h-4 w-4" /></Button>
                    </div>
                  </div></CardContent>
                </Card>
              ); })}
            </div>
          )}
          {inProgressDecisions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">In Progress</h3>
              {inProgressDecisions.map(d => { const agent = agents.find(a => a.id === d.agent); return (
                <Card key={d.id} className="border-l-4 border-l-blue-400 cursor-pointer opacity-90 hover:shadow-md transition-shadow" onClick={() => { setSelectedDecision(d); setFeedback(""); }}>
                  <CardContent className="p-3"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><Loader2 className="h-4 w-4 animate-spin text-blue-500" /><div><h4 className="font-medium text-sm">{d.title}</h4><span className="text-[11px] text-muted-foreground">{agent?.name} · {new Date(d.createdAt).toLocaleDateString()}</span></div></div><Button size="sm" variant="ghost" className="h-8 text-emerald-600" onClick={e => { e.stopPropagation(); updateDecision(d.id, "completed"); }}><Check className="h-3.5 w-3.5 mr-1" /> Done</Button></div></CardContent>
                </Card>
              ); })}
            </div>
          )}
          {openDecisions.length === 0 && inProgressDecisions.length === 0 && (
            <Card><CardContent className="py-12 text-center"><Sparkles className="h-12 w-12 text-teal/40 mx-auto mb-3" /><p className="text-lg font-medium">All clear!</p><p className="text-sm text-muted-foreground">No pending decisions.</p></CardContent></Card>
          )}
          {showArchive && completedDecisions.length > 0 && (
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><Archive className="h-4 w-4" /> Resolved ({completedDecisions.length})</CardTitle></CardHeader><CardContent><div className="space-y-1">{completedDecisions.slice(0, 30).map(d => (<div key={d.id} className="flex items-center gap-2 py-1.5 text-sm cursor-pointer hover:bg-muted/50 rounded px-2 -mx-2" onClick={() => { setSelectedDecision(d); setFeedback(""); }}><Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /><span className="line-through text-muted-foreground flex-1 truncate">{d.title}</span><span className="text-[10px] text-muted-foreground shrink-0">{d.agent} · {new Date(d.createdAt).toLocaleDateString()}</span></div>))}</div></CardContent></Card>
          )}
        </div>
      )}

      {/* ═══ AGENTS TAB ═══ */}
      {tab === "agents" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map(agent => (
            <Card key={agent.id} className="hover:shadow-lg transition-all cursor-pointer group hover:border-teal/40" onClick={() => setSelectedAgent(agent)}>
              <CardContent className="pt-6"><div className="flex items-start gap-4"><div className="rounded-full h-12 w-12 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md" style={{ background: agent.color }}>{agent.avatar}</div><div className="min-w-0 flex-1"><h3 className="font-semibold text-navy group-hover:text-teal transition-colors">{agent.name}</h3><p className="text-sm text-teal font-medium">{agent.role}</p><p className="text-xs text-muted-foreground mt-1 line-clamp-2">{agent.bio}</p><div className="flex flex-wrap gap-1 mt-3">{agent.skills.slice(0, 4).map(s => <span key={s} className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full">{s}</span>)}{agent.skills.length > 4 && <span className="text-[10px] text-muted-foreground">+{agent.skills.length - 4}</span>}</div></div></div></CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ═══ STANDUPS TAB — React-Markdown ═══ */}
      {tab === "standups" && (
        <div className="space-y-3">
          {logs.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-sm text-muted-foreground">No standup logs. Run <code className="bg-muted px-1.5 py-0.5 rounded text-xs">node agents/run-fleet.mjs</code> then sync.</p></CardContent></Card>
          ) : logs.map(log => (
            <Card key={log.date} className="overflow-hidden">
              <button className="w-full text-left p-4 hover:bg-muted/30 transition-colors flex items-center gap-3" onClick={() => setExpandedLog(expandedLog === log.date ? null : log.date)}>
                {expandedLog === log.date ? <ChevronDown className="h-4 w-4 shrink-0 text-teal" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{log.date}</span>
                    {log.hasCeoItems && <Badge variant="destructive" className="text-[10px] px-1.5 py-0 animate-pulse">CEO Action</Badge>}
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{log.decisionCount} decisions</Badge>
                    <span className="text-xs text-muted-foreground">{log.sizeKB} KB</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {log.agents.map(a => <span key={a} className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full">{a}</span>)}
                  </div>
                </div>
              </button>
              {expandedLog === log.date && (
                <div className="border-t bg-white">
                  <ScrollArea className="h-[70vh] sm:h-[600px]">
                    <div className="p-4 sm:p-6 lg:p-8">
                      <article className="prose prose-sm sm:prose-base max-w-none
                        prose-headings:text-navy prose-headings:font-bold
                        prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-teal/20
                        prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
                        prose-h4:text-base prose-h4:mt-5 prose-h4:mb-2
                        prose-p:text-muted-foreground prose-p:leading-relaxed
                        prose-li:text-muted-foreground prose-li:text-sm
                        prose-strong:text-foreground prose-strong:font-semibold
                        prose-blockquote:border-teal/40 prose-blockquote:bg-teal/5 prose-blockquote:rounded-r-lg prose-blockquote:py-1
                        prose-table:text-sm prose-th:text-left prose-th:font-semibold prose-th:text-navy prose-th:bg-muted/50
                        prose-td:py-2 prose-td:px-3 prose-th:py-2 prose-th:px-3
                        prose-hr:my-6 prose-hr:border-border/50
                        prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-normal
                        [&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-border/30 [&_table]:rounded-lg [&_table]:overflow-hidden
                        [&_td]:border-b [&_td]:border-border/20 [&_th]:border-b-2 [&_th]:border-border/30
                      ">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{log.content}</ReactMarkdown>
                      </article>
                    </div>
                  </ScrollArea>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* ═══ PLAYBOOK (Code of Conduct) TAB ═══ */}
      {tab === "playbook" && (
        <div className="space-y-4">
          <Card className="bg-gradient-to-r from-navy/5 to-teal/5 border-navy/10">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-navy" />
                  <div><h3 className="font-semibold text-navy">Code of Conduct</h3><p className="text-xs text-muted-foreground">The single operating document for the agent fleet</p></div>
                </div>
                <Badge variant="outline" className="text-[10px]">Updated: {cocUpdated}</Badge>
              </div>
            </CardContent>
          </Card>
          {cocSections.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-sm text-muted-foreground">Code of Conduct not found. Ensure <code className="bg-muted px-1.5 py-0.5 rounded text-xs">agents/CODE-OF-CONDUCT.md</code> exists.</p></CardContent></Card>
          ) : (
            <div className="space-y-2">
              {cocSections.map((section, idx) => (
                <Card key={idx} className="overflow-hidden">
                  <button className="w-full text-left p-4 hover:bg-muted/30 transition-colors flex items-center gap-3" onClick={() => setExpandedCocSection(expandedCocSection === idx ? null : idx)}>
                    {expandedCocSection === idx ? <ChevronDown className="h-4 w-4 shrink-0 text-teal" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                    <span className="font-semibold text-sm">{section.title}</span>
                  </button>
                  {expandedCocSection === idx && (
                    <div className="border-t bg-white">
                      <ScrollArea className="max-h-[70vh] sm:max-h-[500px]">
                        <div className="p-4 sm:p-6">
                          <article className="prose prose-sm max-w-none prose-headings:text-navy prose-h3:text-base prose-h3:mt-5 prose-h3:mb-2 prose-p:text-muted-foreground prose-p:text-sm prose-p:leading-relaxed prose-li:text-sm prose-li:text-muted-foreground prose-strong:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:rounded prose-code:text-xs prose-table:text-sm [&_table]:w-full [&_table]:border-collapse [&_td]:py-1.5 [&_td]:px-2 [&_th]:py-1.5 [&_th]:px-2 [&_td]:border-b [&_td]:border-border/20 [&_th]:border-b [&_th]:font-semibold [&_th]:text-navy">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.content}</ReactMarkdown>
                          </article>
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ DECISION DETAIL DIALOG ═══ */}
      <Dialog open={!!selectedDecision} onOpenChange={() => setSelectedDecision(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedDecision && (() => { const agent = agents.find(a => a.id === selectedDecision.agent); const p = priorityConfig[selectedDecision.priority] || priorityConfig.normal; return (<>
            <DialogHeader><div className="flex items-center gap-2 mb-2"><Badge className={`${p.color} border`}>{p.label}</Badge><Badge variant="outline">{selectedDecision.status}</Badge></div><DialogTitle className="text-lg leading-snug">{selectedDecision.title}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              {agent && (<div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"><div className="w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center" style={{ background: agent.color }}>{agent.avatar}</div><div><p className="text-sm font-medium">{agent.name}</p><p className="text-xs text-muted-foreground">{agent.role} · {new Date(selectedDecision.createdAt).toLocaleString()}</p></div></div>)}
              {selectedDecision.content && (<div className="prose prose-sm max-w-none bg-slate-50 p-4 rounded-lg border max-h-48 overflow-y-auto"><ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedDecision.content}</ReactMarkdown></div>)}
              {selectedDecision.assignedTo && (<div className="text-sm"><span className="text-muted-foreground">Assigned to:</span> <strong>{selectedDecision.assignedTo}</strong></div>)}
              {selectedDecision.status !== "completed" && (<div className="space-y-2"><label className="text-sm font-medium">Your Feedback</label><textarea className="w-full rounded-lg border p-3 text-sm min-h-[80px] resize-none focus:ring-2 focus:ring-teal/50 focus:border-teal" placeholder="Add feedback, comments, or instructions..." value={feedback} onChange={e => setFeedback(e.target.value)} /></div>)}
              <div className="flex gap-2 pt-2">
                {selectedDecision.status !== "completed" ? (<>
                  <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => updateDecision(selectedDecision.id, "completed", feedback || undefined)}><Check className="h-4 w-4 mr-2" /> Approve</Button>
                  <Button variant="outline" className="flex-1" onClick={() => updateDecision(selectedDecision.id, "in_progress", feedback || undefined)}><ArrowRight className="h-4 w-4 mr-2" /> In Progress</Button>
                  {feedback && <Button variant="outline" onClick={() => updateDecision(selectedDecision.id, selectedDecision.status, feedback)}><Send className="h-4 w-4" /></Button>}
                </>) : <Button variant="outline" className="flex-1" onClick={() => updateDecision(selectedDecision.id, "open")}>Reopen</Button>}
              </div>
            </div>
          </>); })()}
        </DialogContent>
      </Dialog>

      {/* ═══ NEW DECISION DIALOG ═══ */}
      <Dialog open={showNewDecision} onOpenChange={setShowNewDecision}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New Decision / Task</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium mb-1 block">Title</label><Input placeholder="What needs to be decided or done?" value={newTitle} onChange={e => setNewTitle(e.target.value)} /></div>
            <div className="relative">
              <label className="text-sm font-medium mb-1 block">Details <span className="text-muted-foreground font-normal">(@ to mention)</span></label>
              <textarea ref={contentRef} className="w-full rounded-lg border p-3 text-sm min-h-[100px] resize-none focus:ring-2 focus:ring-teal/50 focus:border-teal" placeholder="Describe the task, @mention agents..." value={newContent} onChange={e => setNewContent(e.target.value)} onKeyUp={() => { const v = newContent; const p = contentRef.current?.selectionStart || 0; const last = v.lastIndexOf("@", p); setShowMentionDropdown(last >= 0 && p - last <= 12 && !v.substring(last, p).includes(" ")); }} />
              {showMentionDropdown && (<div className="absolute bottom-0 left-0 bg-white border rounded-lg shadow-lg z-50 w-60 max-h-48 overflow-y-auto">{agents.map(a => (<button key={a.id} className="w-full text-left px-3 py-2 hover:bg-muted/50 flex items-center gap-2 text-sm" onClick={() => insertMention(a.id)}><span className="w-6 h-6 rounded-full text-white text-[10px] font-bold flex items-center justify-center" style={{ background: a.color }}>{a.avatar[0]}</span><div><p className="font-medium">{a.name}</p><p className="text-[10px] text-muted-foreground">{a.role}</p></div></button>))}</div>)}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium mb-1 block">Priority</label><select className="w-full rounded-lg border p-2 text-sm" value={newPriority} onChange={e => setNewPriority(e.target.value)}><option value="critical">🔴 Critical</option><option value="high">🟡 High</option><option value="normal">🔵 Normal</option><option value="low">⚪ Low</option></select></div>
              <div><label className="text-sm font-medium mb-1 block">Assign to</label><select className="w-full rounded-lg border p-2 text-sm" value={newAssignee} onChange={e => setNewAssignee(e.target.value)}><option value="">Unassigned</option>{agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
            </div>
            <Button className="w-full bg-navy hover:bg-navy/90" onClick={addDecision} disabled={adding || !newTitle.trim()}><Plus className="h-4 w-4 mr-2" /> Create</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ AGENT DETAIL DIALOG ═══ */}
      <Dialog open={!!selectedAgent} onOpenChange={() => setSelectedAgent(null)}>
        <DialogContent className="max-w-md">
          {selectedAgent && (<><DialogHeader><div className="flex items-center gap-4"><div className="w-14 h-14 rounded-full text-white text-lg font-bold flex items-center justify-center shadow-lg" style={{ background: selectedAgent.color }}>{selectedAgent.avatar}</div><div><DialogTitle>{selectedAgent.name}</DialogTitle><p className="text-sm text-teal font-medium">{selectedAgent.role}</p></div></div></DialogHeader><div className="space-y-4 mt-2"><p className="text-sm text-muted-foreground leading-relaxed">{selectedAgent.bio}</p><div><h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><Star className="h-4 w-4 text-gold" /> Skills</h4><div className="flex flex-wrap gap-1.5">{selectedAgent.skills.map(s => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}</div></div></div></>)}
        </DialogContent>
      </Dialog>
    </div>
  );
}
