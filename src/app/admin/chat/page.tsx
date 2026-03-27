"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2, Plus, Check, Send, Circle, MessageSquare, Zap,
} from "lucide-react";

interface Agent { id: string; name: string; role: string; avatar: string; color: string; }
interface ChatMsg { id: string; threadId: string; parentId: string | null; sender: string; content: string; mentions: string | null; attachments: string | null; metadata: string | null; status: string; createdAt: string; }
interface ChatThreadData { id: string; title: string; triggerType: string; participants: string; status: string; createdAt: string; updatedAt: string; messages: ChatMsg[]; _count?: { messages: number }; }

const AGENTS: Agent[] = [
  { id: "alex", name: "Alex Chen", role: "Co-CEO / COO", avatar: "AC", color: "#0F2B46" },
  { id: "amy", name: "Amy Lin", role: "CFO", avatar: "AL", color: "#059669" },
  { id: "seth", name: "Seth Parker", role: "CTO", avatar: "SP", color: "#2563EB" },
  { id: "rachel", name: "Rachel Morales", role: "CMO", avatar: "RM", color: "#D97706" },
  { id: "seto", name: "Seto Nakamura", role: "PRO / Editor", avatar: "SN", color: "#7C3AED" },
  { id: "tiffany", name: "Tiffany Wang", role: "CSO", avatar: "TW", color: "#EC4899" },
];

export default function AdminChatPage() {
  const [threads, setThreads] = useState<ChatThreadData[]>([]);
  const [activeThread, setActiveThread] = useState<ChatThreadData | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [text, setText] = useState("");
  const [mentions, setMentions] = useState<string[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const prevMsgCount = useRef(-1); // -1 = initial load (don't scroll)

  // Load thread list
  const loadThreads = useCallback(() => {
    fetch("/api/admin/fleet/chat")
      .then(r => r.json())
      .then(data => {
        if (data.threads) setThreads(data.threads);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Load a specific thread's messages — only scroll if new messages arrived
  const scrollToBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (container) {
      setTimeout(() => { container.scrollTop = container.scrollHeight; }, 50);
    }
  }, []);

  const loadThread = useCallback((threadId: string, shouldScroll = false) => {
    fetch(`/api/admin/fleet/chat?threadId=${threadId}`)
      .then(r => r.json())
      .then(data => {
        if (data.thread) {
          setActiveThread(data.thread);
          const newMsgs = data.thread.messages || [];
          setMessages(newMsgs);
          // Only scroll if explicitly requested (new message sent) or new messages arrived during polling
          if (shouldScroll || (prevMsgCount.current >= 0 && newMsgs.length > prevMsgCount.current)) {
            scrollToBottom();
          }
          prevMsgCount.current = newMsgs.length;
        }
      })
      .catch(() => {});
  }, [scrollToBottom]);

  // Initial load
  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  // Auto-select latest thread on first load
  useEffect(() => {
    if (!activeThread && threads.length > 0 && loading === false) {
      loadThread(threads[0].id);
    }
  }, [threads, activeThread, loading, loadThread]);

  // Poll every 5 seconds — only refresh data, no forced scroll
  useEffect(() => {
    const interval = setInterval(() => {
      loadThreads();
      if (activeThread) loadThread(activeThread.id);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeThread, loadThreads, loadThread]);

  const sendMessage = async () => {
    if (!text.trim() && !image) return;
    setSending(true);
    try {
      const threadId = activeThread?.id || null;
      if (image) {
        const form = new FormData();
        form.append("text", text);
        form.append("mentions", mentions.join(","));
        if (threadId) form.append("threadId", threadId);
        form.append("image", image);
        await fetch("/api/admin/fleet/chat", { method: "POST", body: form });
      } else {
        await fetch("/api/admin/fleet/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, mentions, threadId }),
        });
      }
      setText("");
      setMentions([]);
      setImage(null);
      setImagePreview(null);
      // Reload — scroll to bottom since user just sent a message
      if (activeThread) {
        loadThread(activeThread.id, true);
      } else {
        prevMsgCount.current = -1;
        setTimeout(() => {
          fetch("/api/admin/fleet/chat").then(r => r.json()).then(data => {
            if (data.threads?.length > 0) {
              setThreads(data.threads);
              loadThread(data.threads[0].id, true);
            }
          });
        }, 300);
      }
      loadThreads();
    } catch { /* ignore */ }
    setSending(false);
  };

  const triggerAgentResponse = async () => {
    if (!activeThread) return;
    setTriggering(true);
    try {
      const res = await fetch("/api/admin/fleet/chat/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId: activeThread.id }),
      });
      const data = await res.json();
      if (res.status === 503) {
        alert(data.error || "Claude CLI not available. Use the dev PC for agent chat.");
      } else if (data.triggered) {
        loadThread(activeThread.id, true);
        loadThreads();
      } else if (data.error) {
        alert(`Trigger failed: ${data.error}`);
      }
    } catch { /* ignore */ }
    setTriggering(false);
  };

  const startNewThread = () => {
    setActiveThread(null);
    setMessages([]);
    setMentions([]);
    setText("");
    prevMsgCount.current = -1;
    inputRef.current?.focus();
  };

  const toggleMention = (agentId: string) => {
    setMentions(prev => prev.includes(agentId) ? prev.filter(m => m !== agentId) : [...prev, agentId]);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-teal" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agent Chat</h1>
          <p className="text-muted-foreground text-sm">Conversations with your AI team</p>
        </div>
        <div className="flex items-center gap-2">
          {activeThread && (
            <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={triggerAgentResponse} disabled={triggering}>
              {triggering ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
              {triggering ? "Agents responding..." : "Trigger Response"}
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-4" style={{ height: "calc(100vh - 200px)", minHeight: "500px" }}>
        {/* Thread sidebar */}
        <Card className="w-72 shrink-0 flex flex-col">
          <div className="p-3 border-b flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-1.5"><MessageSquare className="h-4 w-4" /> Threads</h3>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={startNewThread} title="New thread">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {threads.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No conversations yet</p>
              )}
              {threads.map(thread => {
                const lastMsg = thread.messages?.[0];
                const isActive = activeThread?.id === thread.id;
                const participants = thread.participants.split(",").filter(Boolean);
                return (
                  <button key={thread.id} onClick={() => { prevMsgCount.current = -1; loadThread(thread.id); }}
                    className={`w-full text-left p-2.5 rounded-lg transition-colors ${isActive ? "bg-navy/10 border border-navy/20" : "hover:bg-muted/60"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex -space-x-1.5">
                        {participants.filter(p => p !== "jacky").slice(0, 3).map(p => {
                          const a = AGENTS.find(ag => ag.id === p);
                          return a ? (
                            <div key={p} className="w-5 h-5 rounded-full text-[7px] text-white font-bold flex items-center justify-center ring-1 ring-white" style={{ background: a.color }}>{a.avatar?.[0]}</div>
                          ) : null;
                        })}
                      </div>
                      <span className="text-[10px] text-muted-foreground">{new Date(thread.updatedAt).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                      {thread.status === "active" && <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500 ml-auto" />}
                    </div>
                    <p className="text-xs font-medium truncate">{thread.title.substring(0, 60)}</p>
                    {lastMsg && <p className="text-[10px] text-muted-foreground truncate mt-0.5">{lastMsg.sender === "jacky" ? "You" : AGENTS.find(a => a.id === lastMsg.sender)?.name?.split(" ")[0] || lastMsg.sender}: {lastMsg.content.substring(0, 50)}</p>}
                    {thread._count && <span className="text-[9px] text-muted-foreground">{thread._count.messages} msgs</span>}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </Card>

        {/* Message pane */}
        <Card className="flex-1 flex flex-col">
          {/* Thread header */}
          {activeThread ? (
            <div className="p-3 border-b flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold truncate max-w-lg">{activeThread.title.substring(0, 80)}</h3>
                <div className="flex items-center gap-1 mt-0.5">
                  {activeThread.participants.split(",").filter(Boolean).map(p => {
                    const a = AGENTS.find(ag => ag.id === p);
                    return a ? <span key={p} className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted">{a.name.split(" ")[0]}</span> : p === "jacky" ? <span key={p} className="text-[9px] px-1.5 py-0.5 rounded-full bg-teal/20 text-teal">You</span> : null;
                  })}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className="text-[9px]">{activeThread.status}</Badge>
                {activeThread.status === "active" && (
                  <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={async () => {
                    await fetch("/api/admin/fleet/chat", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ threadId: activeThread.id, status: "resolved" }) });
                    loadThreads();
                  }}>
                    <Check className="h-3 w-3 mr-1" /> Resolve
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3 border-b">
              <h3 className="text-sm font-semibold text-muted-foreground">New conversation</h3>
              <p className="text-[10px] text-muted-foreground">@mention agents or just type — messages route to the right team member</p>
            </div>
          )}

          {/* Messages */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && !activeThread && (
              <div className="text-center py-12 text-muted-foreground">
                <Send className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Start a conversation with your team</p>
                <p className="text-xs mt-1">@mention agents directly or type a question — it&apos;ll be routed to the right person.</p>
                <p className="text-xs mt-3 text-muted-foreground/60">After sending, click <strong>&quot;Trigger Response&quot;</strong> to get agent replies.</p>
              </div>
            )}
            {messages.map((msg) => {
              const isCeo = msg.sender === "jacky";
              const isSystem = msg.sender === "system";
              const agentData = AGENTS.find(a => a.id === msg.sender);
              const senderColor = isCeo ? "#2EC4B6" : (agentData?.color || "#94a3b8");
              const senderName = isCeo ? "Jacky" : (agentData?.name || msg.sender);
              const mentionedAgents = (msg.mentions || "").split(",").filter(Boolean);
              const textContent = msg.content.replace(/\n\n!\[.*?\]\(.*?\)/g, "").trim();
              const imageMatch = msg.content.match(/!\[.*?\]\((.*?)\)/);
              const imgUrl = imageMatch ? imageMatch[1] : null;

              if (isSystem) {
                return (
                  <div key={msg.id} className="text-center">
                    <span className="text-[10px] bg-muted px-3 py-1 rounded-full text-muted-foreground">{textContent}</span>
                  </div>
                );
              }

              return (
                <div key={msg.id} className={`flex gap-3 ${isCeo ? "flex-row-reverse" : ""}`}>
                  <div className="shrink-0">
                    <div className="w-8 h-8 rounded-full text-[10px] text-white font-bold flex items-center justify-center" style={{ background: senderColor }}>
                      {isCeo ? "JZ" : (agentData?.avatar?.[0] || "?")}
                    </div>
                  </div>
                  <div className={`max-w-[75%] ${isCeo ? "text-right" : ""}`}>
                    <div className={`rounded-2xl px-4 py-2.5 ${isCeo ? "bg-navy text-white" : "bg-muted"}`}>
                      {mentionedAgents.length > 0 && (
                        <div className="flex gap-1 mb-1 flex-wrap">
                          {mentionedAgents.map(m => {
                            const a = AGENTS.find(ag => ag.id === m);
                            return a ? <span key={m} className={`text-[10px] px-1.5 py-0.5 rounded-full ${isCeo ? "bg-white/20 text-white/90" : "bg-teal/20 text-teal"}`}>@{a.name.split(" ")[0]}</span> : null;
                          })}
                        </div>
                      )}
                      <div className={`text-sm whitespace-pre-wrap leading-relaxed ${isCeo ? "" : "prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2"}`}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{textContent}</ReactMarkdown>
                      </div>
                      {imgUrl && (
                        <img src={imgUrl} alt="attached" className="mt-2 rounded-lg max-w-full max-h-48 object-cover cursor-pointer" onClick={() => window.open(imgUrl, "_blank")} />
                      )}
                    </div>
                    <div className={`flex items-center gap-2 mt-1 text-[10px] text-muted-foreground ${isCeo ? "justify-end" : ""}`}>
                      <span>{senderName}</span>
                      <span>·</span>
                      <span>{new Date(msg.createdAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      {msg.status === "pending_response" && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 animate-pulse">⏳ Thinking...</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mention bar */}
          <div className="border-t px-4 py-2 bg-muted/30">
            <div className="flex items-center gap-1 overflow-x-auto">
              <span className="text-[10px] text-muted-foreground shrink-0 mr-1">Mention:</span>
              {AGENTS.map(a => (
                <button key={a.id} onClick={() => toggleMention(a.id)}
                  className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-full text-[11px] transition-colors ${mentions.includes(a.id) ? "bg-navy text-white" : "bg-muted hover:bg-muted/80"}`}>
                  <span className="w-4 h-4 rounded-full text-[8px] text-white font-bold flex items-center justify-center" style={{ background: a.color }}>{a.avatar[0]}</span>
                  {a.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Image preview */}
          {imagePreview && (
            <div className="px-4 py-2 border-t bg-muted/20">
              <div className="relative inline-block">
                <img src={imagePreview} alt="preview" className="h-20 rounded-lg object-cover" />
                <button className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center" onClick={() => { setImage(null); setImagePreview(null); }}>✕</button>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t p-3 flex gap-2 items-end">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
            <Button variant="ghost" size="sm" className="shrink-0 h-10 w-10 p-0" onClick={() => fileRef.current?.click()}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            </Button>
            <textarea
              ref={inputRef}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={mentions.length > 0 ? `Message to ${mentions.map(m => AGENTS.find(a => a.id === m)?.name.split(" ")[0]).join(", ")}...` : activeThread ? "Reply in this thread..." : "Start a new conversation... (Enter to send)"}
              className="flex-1 rounded-xl border p-3 text-sm min-h-[44px] max-h-32 resize-none focus:ring-2 focus:ring-teal/50 focus:border-teal"
              rows={1}
            />
            <Button className="shrink-0 bg-navy hover:bg-navy/90 h-10 w-10 p-0" onClick={sendMessage} disabled={sending || (!text.trim() && !image)}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
