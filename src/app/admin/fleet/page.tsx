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
  Calendar, Loader2, Bot, Plus, Check, Clock,
  Send, Archive, ArrowRight, Star, Sparkles, BookOpen,
  Activity, Circle, TrendingUp, BarChart3,
} from "lucide-react";

interface Agent { id: string; name: string; role: string; avatar: string; avatarUrl?: string; color: string; skills: string[]; bio: string; stats: { total: number; approved: number; rejected: number; open: number }; }
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

// Markdown prose classes — designed to match VS Code preview readability
const mdClasses = `prose prose-base max-w-none
  prose-headings:text-navy prose-headings:font-bold prose-headings:tracking-tight
  prose-h1:text-2xl prose-h1:mt-10 prose-h1:mb-4
  prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-5 prose-h2:pb-3 prose-h2:border-b-2 prose-h2:border-teal/30
  prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-4
  prose-h4:text-base prose-h4:mt-6 prose-h4:mb-3 prose-h4:text-navy/80
  prose-p:text-foreground/80 prose-p:leading-7 prose-p:my-3
  prose-li:text-foreground/80 prose-li:leading-7 prose-li:my-1
  prose-ul:my-4 prose-ol:my-4
  prose-strong:text-foreground prose-strong:font-semibold
  prose-em:text-foreground/60
  prose-blockquote:border-l-4 prose-blockquote:border-teal/40 prose-blockquote:bg-teal/5 prose-blockquote:rounded-r-lg prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:my-5 prose-blockquote:not-italic
  prose-a:text-teal prose-a:no-underline hover:prose-a:underline
  prose-hr:my-8 prose-hr:border-t-2 prose-hr:border-border/40
  prose-code:bg-slate-100 prose-code:text-navy prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm prose-code:font-normal prose-code:before:content-none prose-code:after:content-none
  prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-xl prose-pre:p-4
  prose-img:rounded-xl prose-img:shadow-md
  [&_table]:w-full [&_table]:my-6 [&_table]:border-collapse [&_table]:border [&_table]:border-border/40 [&_table]:rounded-xl [&_table]:overflow-hidden [&_table]:shadow-sm
  [&_th]:bg-navy/5 [&_th]:text-navy [&_th]:font-semibold [&_th]:text-left [&_th]:py-3 [&_th]:px-4 [&_th]:text-sm [&_th]:border-b-2 [&_th]:border-border/40
  [&_td]:py-2.5 [&_td]:px-4 [&_td]:text-sm [&_td]:border-b [&_td]:border-border/20
  [&_tr:hover]:bg-muted/30
  [&_tr:last-child_td]:border-b-0
  overflow-x-auto`;

export default function OperationsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [logs, setLogs] = useState<LogSummary[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [cocSections, setCocSections] = useState<CocSection[]>([]);
  const [cocUpdated, setCocUpdated] = useState("");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "decisions" | "agents" | "standups" | "playbook" | "chat">("overview");
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
  const [agentDecisions, setAgentDecisions] = useState<Decision[]>([]);
  const [showArchive, setShowArchive] = useState(false);
  const [expandedCocSection, setExpandedCocSection] = useState<number | null>(0);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<Decision[]>([]);
  const [chatText, setChatText] = useState("");
  const [chatMentions, setChatMentions] = useState<string[]>([]);
  const [chatImage, setChatImage] = useState<File | null>(null);
  const [chatImagePreview, setChatImagePreview] = useState<string | null>(null);
  const [chatSending, setChatSending] = useState(false);
  const [chatMentionOpen, setChatMentionOpen] = useState(false);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatFileRef = useRef<HTMLInputElement>(null);
  const [chatReplyTo, setChatReplyTo] = useState<Decision | null>(null);

  const fetchData = useCallback(() => {
    fetch("/api/admin/fleet")
      .then(r => r.json())
      .then(data => {
        setAgents(data.agents || []);
        setDecisions(data.decisions || []);
        setLogs(data.logs || []);
        setTimeline(data.timeline || []);
        if (data.coc) { setCocSections(data.coc.sections || []); setCocUpdated(data.coc.updatedAt || ""); }
        // Auto-select latest day
        if (data.logs?.length > 0 && !selectedDay) setSelectedDay(data.logs[0].date);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Load per-agent decisions when agent is selected
  useEffect(() => {
    if (selectedAgent) {
      fetch(`/api/admin/fleet?agentId=${selectedAgent.id}`)
        .then(r => r.json())
        .then(data => setAgentDecisions(data.decisions || []))
        .catch(() => setAgentDecisions([]));
    }
  }, [selectedAgent]);

  // Load chat messages when chat tab is active
  const loadChat = useCallback(() => {
    fetch("/api/admin/fleet/chat")
      .then(r => r.json())
      .then(data => {
        setChatMessages(data.messages || []);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (tab === "chat") loadChat();
  }, [tab, loadChat]);

  const sendChat = async () => {
    if (!chatText.trim() && !chatImage) return;
    setChatSending(true);

    try {
      if (chatImage) {
        const form = new FormData();
        form.append("text", chatText);
        form.append("mentions", chatMentions.join(","));
        form.append("image", chatImage);
        await fetch("/api/admin/fleet/chat", { method: "POST", body: form });
      } else {
        await fetch("/api/admin/fleet/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: chatText, mentions: chatMentions }),
        });
      }
      setChatText("");
      setChatMentions([]);
      setChatImage(null);
      setChatImagePreview(null);
      setChatReplyTo(null);
      loadChat();
    } catch { /* ignore */ }
    setChatSending(false);
  };

  const handleChatImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setChatImage(file);
      const reader = new FileReader();
      reader.onload = () => setChatImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const toggleChatMention = (agentId: string) => {
    setChatMentions(prev => prev.includes(agentId) ? prev.filter(m => m !== agentId) : [...prev, agentId]);
  };

  const updateDecision = async (id: string, status: string, extra?: string) => {
    const d = decisions.find(x => x.id === id);
    const nc = extra ? `${d?.content || ""}\n\n---\n**CEO Feedback (${new Date().toLocaleDateString()}):** ${extra}` : undefined;
    await fetch("/api/admin/fleet", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status, ...(nc && { content: nc }) }) });
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
  const rejectedDecisions = decisions.filter(d => d.status === "rejected");

  const timelineByDate: Record<string, TimelineItem[]> = {};
  for (const item of timeline) {
    const date = new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (!timelineByDate[date]) timelineByDate[date] = [];
    timelineByDate[date].push(item);
  }

  const selectedLog = selectedDay ? logs.find(l => l.date === selectedDay) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Operations</h1>
          <p className="text-muted-foreground text-sm">Agent fleet, decisions, standups & playbook</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border bg-muted/50 p-1 overflow-x-auto">
          {(["overview", "decisions", "agents", "standups", "chat", "playbook"] as const).map(t => (
            <Button key={t} variant={tab === t ? "default" : "ghost"} size="sm" onClick={() => setTab(t)} className="capitalize text-xs sm:text-sm whitespace-nowrap">{t}</Button>
          ))}
        </div>
      </div>

      {/* Stats — clickable to navigate to relevant tab */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <Card className={`cursor-pointer hover:shadow-md transition-shadow ${openDecisions.length > 0 ? "border-amber-200 bg-amber-50/30" : ""}`} onClick={() => setTab("decisions")}>
          <CardContent className="pt-5 pb-4"><div className="flex items-center gap-3"><div className={`rounded-lg p-2 ${openDecisions.length > 0 ? "bg-amber-100" : "bg-slate-100"}`}><AlertTriangle className={`h-4 w-4 ${openDecisions.length > 0 ? "text-amber-600" : "text-slate-400"}`} /></div><div><p className="text-xl font-bold">{openDecisions.length}</p><p className="text-[11px] text-muted-foreground">Open</p></div></div></CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setTab("decisions")}>
          <CardContent className="pt-5 pb-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-blue-100 p-2"><Clock className="h-4 w-4 text-blue-600" /></div><div><p className="text-xl font-bold">{inProgressDecisions.length}</p><p className="text-[11px] text-muted-foreground">In Progress</p></div></div></CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setTab("decisions"); setShowArchive(true); }}>
          <CardContent className="pt-5 pb-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-emerald-100 p-2"><CheckCircle className="h-4 w-4 text-emerald-600" /></div><div><p className="text-xl font-bold">{completedDecisions.length}</p><p className="text-[11px] text-muted-foreground">Resolved</p></div></div></CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setTab("agents")}>
          <CardContent className="pt-5 pb-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-teal/10 p-2"><Bot className="h-4 w-4 text-teal" /></div><div><p className="text-xl font-bold">{agents.length}</p><p className="text-[11px] text-muted-foreground">Agents</p></div></div></CardContent>
        </Card>
      </div>

      {/* ═══ OVERVIEW ═══ */}
      {tab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4 text-teal" /> Activity Timeline</CardTitle></CardHeader>
              <CardContent>
                {Object.keys(timelineByDate).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No activity yet.</p>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(timelineByDate).slice(0, 5).map(([date, items]) => (
                      <div key={date}>
                        <div className="flex items-center gap-2 mb-3"><div className="h-px flex-1 bg-border" /><span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{date}</span><div className="h-px flex-1 bg-border" /></div>
                        <div className="space-y-2 ml-4 border-l-2 border-border/50 pl-4">
                          {items.map(item => (
                            <div key={item.id} className="flex items-start gap-3">
                              <div className="mt-1 -ml-[21px] w-3 h-3 rounded-full border-2 border-white shrink-0" style={{ background: agentColors[item.agent] || "#94a3b8" }} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap"><span className="text-xs">{typeIcons[item.type] || "📄"}</span><span className="text-sm font-medium truncate">{item.title}</span><Badge variant={item.status === "completed" ? "default" : item.status === "open" ? "destructive" : "secondary"} className="text-[9px] px-1 py-0">{item.status}</Badge></div>
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
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4 text-teal" /> Team</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {agents.map(a => (
                    <button key={a.id} className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/50 hover:bg-muted transition-colors" onClick={() => { setTab("agents"); setSelectedAgent(a); }}>
                      <div className="w-5 h-5 rounded-full text-[9px] text-white font-bold flex items-center justify-center" style={{ background: a.color }}>{a.avatar[0]}</div>
                      <span className="text-xs font-medium">{a.name.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ═══ DECISIONS ═══ */}
      {tab === "decisions" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={() => setShowNewDecision(true)} className="bg-navy hover:bg-navy/90"><Plus className="h-4 w-4 mr-2" /> New Task</Button>
            <Button variant="outline" onClick={() => setShowArchive(!showArchive)}><Archive className="h-4 w-4 mr-2" /> Archive ({completedDecisions.length + rejectedDecisions.length})</Button>
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
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-50" onClick={() => updateDecision(d.id, "completed")}><Check className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50" onClick={() => updateDecision(d.id, "in_progress")}><ArrowRight className="h-4 w-4" /></Button>
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
                <Card key={d.id} className="border-l-4 border-l-blue-400 cursor-pointer hover:shadow-md" onClick={() => { setSelectedDecision(d); setFeedback(""); }}>
                  <CardContent className="p-3"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><Loader2 className="h-4 w-4 animate-spin text-blue-500" /><div><h4 className="font-medium text-sm">{d.title}</h4><span className="text-[11px] text-muted-foreground">{agent?.name}</span></div></div><Button size="sm" variant="ghost" className="h-8 text-emerald-600" onClick={e => { e.stopPropagation(); updateDecision(d.id, "completed"); }}><Check className="h-3.5 w-3.5 mr-1" /> Done</Button></div></CardContent>
                </Card>
              ); })}
            </div>
          )}
          {openDecisions.length === 0 && inProgressDecisions.length === 0 && (
            <Card><CardContent className="py-12 text-center"><Sparkles className="h-12 w-12 text-teal/40 mx-auto mb-3" /><p className="text-lg font-medium">All clear!</p></CardContent></Card>
          )}
          {showArchive && (completedDecisions.length > 0 || rejectedDecisions.length > 0) && (
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground"><Archive className="h-4 w-4 inline mr-2" />Resolved ({completedDecisions.length + rejectedDecisions.length})</CardTitle></CardHeader><CardContent><div className="space-y-1">
              {completedDecisions.slice(0, 20).map(d => (<div key={d.id} className="flex items-center gap-2 py-1.5 text-sm cursor-pointer hover:bg-muted/50 rounded px-2 -mx-2" onClick={() => { setSelectedDecision(d); setFeedback(""); }}><Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /><span className="line-through text-muted-foreground flex-1 truncate">{d.title}</span><span className="text-[10px] text-muted-foreground shrink-0">{d.agent}</span></div>))}
              {rejectedDecisions.slice(0, 20).map(d => (<div key={d.id} className="flex items-center gap-2 py-1.5 text-sm cursor-pointer hover:bg-muted/50 rounded px-2 -mx-2" onClick={() => { setSelectedDecision(d); setFeedback(""); }}><span className="text-red-500 shrink-0 text-xs">✕</span><span className="line-through text-red-400 flex-1 truncate">{d.title}</span><span className="text-[10px] text-muted-foreground shrink-0">{d.agent}</span></div>))}
            </div></CardContent></Card>
          )}
        </div>
      )}

      {/* ═══ AGENTS — Employee Central ═══ */}
      {tab === "agents" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map(agent => {
              const approvalRate = agent.stats.total > 0 ? Math.round((agent.stats.approved / agent.stats.total) * 100) : 0;
              return (
                <Card key={agent.id} className="hover:shadow-lg transition-all cursor-pointer group hover:border-teal/40" onClick={() => setSelectedAgent(agent)}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      {agent.avatarUrl ? <img src={agent.avatarUrl} alt={agent.name} className="rounded-full h-12 w-12 object-cover shrink-0 shadow-md border-2" style={{ borderColor: agent.color }} /> : <div className="rounded-full h-12 w-12 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md" style={{ background: agent.color }}>{agent.avatar}</div>}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-navy group-hover:text-teal transition-colors">{agent.name}</h3>
                        <p className="text-sm text-teal font-medium">{agent.role}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {agent.skills.slice(0, 3).map(s => <span key={s} className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full">{s}</span>)}
                          {agent.skills.length > 3 && <span className="text-[10px] text-muted-foreground">+{agent.skills.length - 3}</span>}
                        </div>
                      </div>
                    </div>
                    {/* Performance stats */}
                    <div className="mt-4 pt-3 border-t grid grid-cols-3 gap-2 text-center">
                      <div><p className="text-lg font-bold text-navy">{agent.stats.total}</p><p className="text-[10px] text-muted-foreground">Proposals</p></div>
                      <div><p className="text-lg font-bold text-emerald-600">{agent.stats.approved}</p><p className="text-[10px] text-muted-foreground">Approved</p></div>
                      <div><p className="text-lg font-bold" style={{ color: approvalRate >= 70 ? "#059669" : approvalRate >= 40 ? "#D97706" : "#DC2626" }}>{approvalRate}%</p><p className="text-[10px] text-muted-foreground">Rate</p></div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ STANDUPS — Day pages with inline render ═══ */}
      {tab === "standups" && (
        <div className="space-y-4">
          {/* Day selector pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
            {logs.map(log => (
              <button key={log.date} onClick={() => setSelectedDay(log.date)}
                className={`shrink-0 rounded-xl px-4 py-3 text-left border transition-all ${selectedDay === log.date ? "bg-navy text-white border-navy shadow-lg" : "bg-white hover:border-teal/40 hover:shadow-md"}`}>
                <div className="flex items-center gap-2">
                  <span className={`font-semibold text-sm ${selectedDay === log.date ? "text-white" : "text-navy"}`}>{log.date}</span>
                  {log.hasCeoItems && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] ${selectedDay === log.date ? "text-white/70" : "text-muted-foreground"}`}>{log.decisionCount} decisions · {log.agents.length} agents</span>
                </div>
              </button>
            ))}
          </div>

          {/* Selected day — FULL inline render */}
          {selectedLog ? (
            <Card>
              {/* Header */}
              <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-navy/5 to-teal/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-navy text-lg">Standup — {selectedLog.date}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {selectedLog.agents.map(a => {
                        const agentData = agents.find(ag => ag.name.includes(a));
                        return (
                          <span key={a} className="inline-flex items-center gap-1 text-[11px] bg-white/80 px-2 py-0.5 rounded-full border">
                            {agentData && <span className="w-3 h-3 rounded-full" style={{ background: agentData.color }} />}
                            {a}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{selectedLog.decisionCount} decisions</span>
                    <span>{selectedLog.sizeKB} KB</span>
                  </div>
                </div>
              </div>
              {/* Full content — rendered inline, no sub-dropdowns */}
              <div className="p-4 sm:p-6 lg:p-8">
                <article className={mdClasses}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedLog.content}</ReactMarkdown>
                </article>
              </div>
            </Card>
          ) : (
            <Card><CardContent className="py-16 text-center">
              <Calendar className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Select a date above to view the standup log</p>
            </CardContent></Card>
          )}
        </div>
      )}

      {/* ═══ CHAT TAB ═══ */}
      {tab === "chat" && (
        <Card className="flex flex-col" style={{ height: "calc(100vh - 280px)", minHeight: "400px" }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Send className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No messages yet. Send a message to your agents.</p>
                <p className="text-xs mt-1">Use @ to mention specific agents. They&apos;ll address your messages in the next standup.</p>
              </div>
            )}
            {chatMessages.map((msg) => {
              const isAgent = msg.agent !== "jacky";
              const agentData = agents.find(a => a.id === msg.agent);
              const mentionedAgents = (msg.assignedTo || "").split(",").filter(Boolean);
              const hasImage = msg.content.includes("![");
              const textContent = msg.content.replace(/\n\n!\[.*?\]\(.*?\)/, "").trim();
              const imageMatch = msg.content.match(/!\[.*?\]\((.*?)\)/);
              const imageUrl = imageMatch ? imageMatch[1] : null;

              return (
                <div key={msg.id} className={`flex gap-3 ${isAgent ? "" : "flex-row-reverse"} group cursor-pointer`} onClick={() => { setChatReplyTo(msg); chatInputRef.current?.focus(); }}>
                  <div className="shrink-0">
                    <div className="w-8 h-8 rounded-full text-[10px] text-white font-bold flex items-center justify-center" style={{ background: isAgent ? (agentData?.color || "#94a3b8") : "#2EC4B6" }}>
                      {isAgent ? (agentData?.avatar?.[0] || "?") : "JZ"}
                    </div>
                  </div>
                  <div className={`max-w-[75%] ${isAgent ? "" : "text-right"}`}>
                    <div className={`rounded-2xl px-4 py-2.5 ${isAgent ? "bg-muted" : "bg-navy text-white"}`}>
                      {mentionedAgents.length > 0 && (
                        <div className="flex gap-1 mb-1 flex-wrap">
                          {mentionedAgents.map(m => {
                            const a = agents.find(ag => ag.id === m);
                            return a ? (
                              <span key={m} className={`text-[10px] px-1.5 py-0.5 rounded-full ${isAgent ? "bg-teal/20 text-teal" : "bg-white/20 text-white/90"}`}>@{a.name.split(" ")[0]}</span>
                            ) : null;
                          })}
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{textContent}</p>
                      {imageUrl && (
                        <img src={imageUrl} alt="attached" className="mt-2 rounded-lg max-w-full max-h-48 object-cover cursor-pointer" onClick={() => window.open(imageUrl, "_blank")} />
                      )}
                    </div>
                    <div className={`flex items-center gap-2 mt-1 text-[10px] text-muted-foreground ${isAgent ? "" : "justify-end"}`}>
                      <span>{isAgent ? agentData?.name || msg.agent : "Jacky"}</span>
                      <span>·</span>
                      <span>{new Date(msg.createdAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      {msg.status === "open" && (
                        <button className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                          onClick={async (e) => { e.stopPropagation(); await fetch("/api/admin/fleet/chat", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: msg.id, status: "completed" }) }); loadChat(); }}>
                          ⏳ Pending — click to resolve
                        </button>
                      )}
                      {msg.status === "completed" && <span className="text-[9px] text-emerald-600">✓ Addressed</span>}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Mention bar */}
          <div className="border-t px-4 py-2 bg-muted/30">
            <div className="flex items-center gap-1 overflow-x-auto">
              <span className="text-[10px] text-muted-foreground shrink-0 mr-1">Mention:</span>
              {agents.map(a => (
                <button key={a.id} onClick={() => toggleChatMention(a.id)}
                  className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-full text-[11px] transition-colors ${chatMentions.includes(a.id) ? "bg-navy text-white" : "bg-muted hover:bg-muted/80"}`}>
                  <span className="w-4 h-4 rounded-full text-[8px] text-white font-bold flex items-center justify-center" style={{ background: a.color }}>{a.avatar[0]}</span>
                  {a.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Reply-to banner */}
          {chatReplyTo && (
            <div className="px-4 py-2 border-t bg-navy/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Replying to</span>
                <span className="font-medium text-navy">{chatReplyTo.content.substring(0, 60)}...</span>
              </div>
              <button className="text-xs text-muted-foreground hover:text-red-500" onClick={() => setChatReplyTo(null)}>✕ Cancel</button>
            </div>
          )}

          {/* Image preview */}
          {chatImagePreview && (
            <div className="px-4 py-2 border-t bg-muted/20">
              <div className="relative inline-block">
                <img src={chatImagePreview} alt="preview" className="h-20 rounded-lg object-cover" />
                <button className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center" onClick={() => { setChatImage(null); setChatImagePreview(null); }}>✕</button>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t p-3 flex gap-2 items-end">
            <input ref={chatFileRef} type="file" accept="image/*" className="hidden" onChange={handleChatImageSelect} />
            <Button variant="ghost" size="sm" className="shrink-0 h-10 w-10 p-0" onClick={() => chatFileRef.current?.click()}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            </Button>
            <textarea
              ref={chatInputRef}
              value={chatText}
              onChange={e => setChatText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
              placeholder={chatMentions.length > 0 ? `Message to ${chatMentions.map(m => agents.find(a => a.id === m)?.name.split(" ")[0]).join(", ")}...` : "Message your agents... (Enter to send, Shift+Enter for new line)"}
              className="flex-1 rounded-xl border p-3 text-sm min-h-[44px] max-h-32 resize-none focus:ring-2 focus:ring-teal/50 focus:border-teal"
              rows={1}
            />
            <Button className="shrink-0 bg-navy hover:bg-navy/90 h-10 w-10 p-0" onClick={sendChat} disabled={chatSending || (!chatText.trim() && !chatImage)}>
              {chatSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </Card>
      )}

      {/* ═══ PLAYBOOK ═══ */}
      {tab === "playbook" && (
        <div className="space-y-4">
          <Card className="bg-gradient-to-r from-navy/5 to-teal/5 border-navy/10">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3"><BookOpen className="h-5 w-5 text-navy" /><div><h3 className="font-semibold text-navy">Code of Conduct</h3><p className="text-xs text-muted-foreground">The single operating document for the agent fleet</p></div></div>
                <Badge variant="outline" className="text-[10px]">Updated: {cocUpdated}</Badge>
              </div>
            </CardContent>
          </Card>
          {cocSections.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-sm text-muted-foreground">Code of Conduct not found. Run sync to push it to production.</p></CardContent></Card>
          ) : cocSections.map((section, idx) => (
            <Card key={idx}>
              <button className="w-full text-left p-4 hover:bg-muted/30 transition-colors flex items-center gap-3" onClick={() => setExpandedCocSection(expandedCocSection === idx ? null : idx)}>
                {expandedCocSection === idx ? <ChevronDown className="h-4 w-4 shrink-0 text-teal" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                <span className="font-semibold text-sm">{section.title}</span>
              </button>
              {expandedCocSection === idx && (
                <div className="border-t p-5 sm:p-8">
                  <article className={mdClasses}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.content}</ReactMarkdown>
                  </article>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* ═══ DECISION DETAIL DIALOG ═══ */}
      <Dialog open={!!selectedDecision} onOpenChange={() => setSelectedDecision(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedDecision && (() => {
            const agent = agents.find(a => a.id === selectedDecision.agent);
            const p = priorityConfig[selectedDecision.priority] || priorityConfig.normal;
            const isResolved = selectedDecision.status === "completed" || selectedDecision.status === "rejected";
            return (<>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`${p.color} border`}>{p.label}</Badge>
                  <Badge variant={selectedDecision.status === "completed" ? "default" : selectedDecision.status === "rejected" ? "destructive" : "outline"}>
                    {selectedDecision.status === "completed" ? "✅ Approved" : selectedDecision.status === "rejected" ? "❌ Rejected" : selectedDecision.status === "in_progress" ? "🔄 In Progress" : "⏳ Open"}
                  </Badge>
                </div>
                <DialogTitle className="text-lg leading-snug">{selectedDecision.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Proposer info */}
                {agent && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    {agent.avatarUrl ? (
                      <img src={agent.avatarUrl} alt={agent.name} className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center" style={{ background: agent.color }}>{agent.avatar}</div>
                    )}
                    <div>
                      <p className="text-sm font-medium">Proposed by {agent.name}</p>
                      <p className="text-xs text-muted-foreground">{agent.role} · {new Date(selectedDecision.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                )}

                {/* Threaded content — split into original + replies */}
                {selectedDecision.content && (() => {
                  const parts = selectedDecision.content.split(/\n---\n/);
                  const original = parts[0];
                  const thread = parts.slice(1).filter(p => p.trim());
                  return (
                    <div className="space-y-3">
                      {/* Original proposal */}
                      <div className="bg-slate-50 p-4 rounded-lg border">
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{original}</ReactMarkdown>
                        </div>
                      </div>

                      {/* Thread: CEO feedback + agent replies */}
                      {thread.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Thread ({thread.length} {thread.length === 1 ? "reply" : "replies"})</p>
                          {thread.map((entry, i) => {
                            const isCeo = entry.includes("CEO Feedback") || entry.includes("CEO Comment") || entry.includes("APPROVED") || entry.includes("REJECTED") || entry.includes("IN PROGRESS");
                            const isReply = entry.includes("[REPLY from");
                            const replyMatch = entry.match(/\[REPLY from ([^\]]+)\]\s*\(([^)]+)\):\s*(.*)/) || entry.match(/\[REPLY from ([^\]]+)\]:\s*(.*)/);
                            
                            let replyAgent = "";
                            let replyDate = "";
                            let replyText = entry.trim();
                            
                            if (replyMatch) {
                              replyAgent = replyMatch[1];
                              if (replyMatch.length === 4) {
                                replyDate = replyMatch[2];
                                replyText = replyMatch[3];
                              } else {
                                replyText = replyMatch[2];
                              }
                            }

                            const agentId = replyAgent.toLowerCase().split(" ")[0];
                            const replyAgentData = agents.find(a => a.id === agentId || a.name === replyAgent);
                            const bgColor = isCeo ? "bg-teal/5 border-teal/20" : isReply ? "bg-blue-50/50 border-blue-100" : "bg-muted/30 border-border";
                            const borderLeft = isCeo ? "border-l-teal" : isReply ? "border-l-blue-400" : "border-l-slate-300";

                            return (
                              <div key={i} className={`${bgColor} border ${borderLeft} border-l-4 rounded-r-lg p-3`}>
                                <div className="flex items-center gap-2 mb-1.5">
                                  {isCeo ? (
                                    <>
                                      <div className="w-5 h-5 rounded-full bg-teal text-white text-[10px] font-bold flex items-center justify-center">J</div>
                                      <span className="text-xs font-semibold text-teal">CEO (Jacky)</span>
                                    </>
                                  ) : replyAgentData ? (
                                    <>
                                      {replyAgentData.avatarUrl ? (
                                        <img src={replyAgentData.avatarUrl} alt={replyAgentData.name} className="w-5 h-5 rounded-full" />
                                      ) : (
                                        <div className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center" style={{ background: replyAgentData.color }}>{replyAgentData.avatar}</div>
                                      )}
                                      <span className="text-xs font-semibold" style={{ color: replyAgentData.color }}>{replyAgentData.name}</span>
                                    </>
                                  ) : replyAgent ? (
                                    <>
                                      <div className="w-5 h-5 rounded-full bg-slate-400 text-white text-[10px] font-bold flex items-center justify-center">{replyAgent[0]}</div>
                                      <span className="text-xs font-semibold text-slate-600">{replyAgent}</span>
                                    </>
                                  ) : null}
                                  {replyDate && <span className="text-[10px] text-muted-foreground">{replyDate}</span>}
                                </div>
                                <div className="prose prose-sm max-w-none text-sm">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{isReply ? replyText : entry.replace(/^\*\*/g, "").replace(/\*\*$/g, "")}</ReactMarkdown>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {selectedDecision.assignedTo && (
                  <div className="text-sm"><span className="text-muted-foreground">Assigned to:</span> <strong>{selectedDecision.assignedTo}</strong></div>
                )}

                {/* Feedback input — always visible for non-resolved items */}
                {!isResolved && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message / Feedback <span className="text-muted-foreground font-normal">(recorded for next standup)</span></label>
                    <textarea
                      className="w-full rounded-lg border p-3 text-sm min-h-[80px] resize-none focus:ring-2 focus:ring-teal/50 focus:border-teal"
                      placeholder="Add your feedback, instructions, or reasoning..."
                      value={feedback}
                      onChange={e => setFeedback(e.target.value)}
                    />
                  </div>
                )}

                {/* Action buttons */}
                <div className="space-y-2 pt-2">
                  {!isResolved ? (
                    <>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => updateDecision(selectedDecision.id, "completed", feedback ? `✅ APPROVED: ${feedback}` : "✅ APPROVED by CEO")}
                        >
                          <Check className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button
                          variant="outline"
                          className="border-blue-300 text-blue-700 hover:bg-blue-50"
                          onClick={() => updateDecision(selectedDecision.id, "in_progress", feedback ? `🔄 IN PROGRESS: ${feedback}` : "🔄 Moved to in progress by CEO")}
                        >
                          <ArrowRight className="h-4 w-4 mr-1" /> In Progress
                        </Button>
                        <Button
                          variant="outline"
                          className="border-red-300 text-red-700 hover:bg-red-50"
                          onClick={() => updateDecision(selectedDecision.id, "rejected", feedback ? `❌ REJECTED: ${feedback}` : "❌ REJECTED by CEO")}
                        >
                          <span className="mr-1">✕</span> Reject
                        </Button>
                      </div>
                      {feedback && (
                        <Button variant="ghost" className="w-full text-sm text-muted-foreground" onClick={() => updateDecision(selectedDecision.id, selectedDecision.status, `💬 CEO Comment: ${feedback}`)}>
                          <Send className="h-3.5 w-3.5 mr-2" /> Send comment only (keep status)
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => updateDecision(selectedDecision.id, "open", "♻️ Reopened by CEO")}>
                        Reopen
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </>);
          })()}
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
      <Dialog open={!!selectedAgent} onOpenChange={() => { setSelectedAgent(null); setAgentDecisions([]); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedAgent && (<>
            <DialogHeader>
              <div className="flex items-center gap-4">
                {selectedAgent.avatarUrl ? <img src={selectedAgent.avatarUrl} alt={selectedAgent.name} className="w-14 h-14 rounded-full object-cover shadow-lg border-2" style={{ borderColor: selectedAgent.color }} /> : <div className="w-14 h-14 rounded-full text-white text-lg font-bold flex items-center justify-center shadow-lg" style={{ background: selectedAgent.color }}>{selectedAgent.avatar}</div>}
                <div><DialogTitle>{selectedAgent.name}</DialogTitle><p className="text-sm text-teal font-medium">{selectedAgent.role}</p></div>
              </div>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <p className="text-sm text-muted-foreground leading-relaxed">{selectedAgent.bio}</p>
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><Star className="h-4 w-4 text-gold" /> Skills</h4>
                <div className="flex flex-wrap gap-1.5">{selectedAgent.skills.map(s => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}</div>
              </div>
              {/* Performance breakdown */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-teal" /> Performance</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-navy">{selectedAgent.stats.total}</p>
                    <p className="text-[11px] text-muted-foreground">Total Proposals</p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-emerald-600">{selectedAgent.stats.approved}</p>
                    <p className="text-[11px] text-muted-foreground">Approved</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-red-600">{selectedAgent.stats.rejected}</p>
                    <p className="text-[11px] text-muted-foreground">Rejected</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-amber-600">{selectedAgent.stats.open}</p>
                    <p className="text-[11px] text-muted-foreground">Pending</p>
                  </div>
                </div>
                {selectedAgent.stats.total > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Approval Rate</span>
                      <span className="font-semibold">{Math.round((selectedAgent.stats.approved / selectedAgent.stats.total) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(selectedAgent.stats.approved / selectedAgent.stats.total) * 100}%` }} />
                    </div>
                  </div>
                )}
              </div>
              {/* Proposal history */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-3">Proposal History</h4>
                {agentDecisions.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Loading proposals...</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {agentDecisions.map((d: Decision) => (
                      <div key={d.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer text-sm" onClick={() => { setSelectedAgent(null); setSelectedDecision(d); setFeedback(""); }}>
                        <span className="mt-0.5">
                          {d.status === "completed" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> :
                           d.status === "rejected" ? <span className="text-red-500 text-xs">✕</span> :
                           d.status === "in_progress" ? <Clock className="h-3.5 w-3.5 text-blue-500" /> :
                           <Circle className="h-3.5 w-3.5 text-amber-500" />}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs leading-snug ${d.status === "completed" || d.status === "rejected" ? "text-muted-foreground line-through" : "text-foreground"}`}>{d.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(d.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>)}
        </DialogContent>
      </Dialog>
    </div>
  );
}
