"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, X, Send, Bot, User, ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

// ── Knowledge base for the chatbot ─────────────────────────────
interface QuickAction { label: string; href: string; }

interface KnowledgeEntry {
  keywords: string[];
  answer: string;
  actions?: QuickAction[];
}

const KNOWLEDGE: KnowledgeEntry[] = [
  {
    keywords: ["quote", "price", "cost", "how much", "pricing", "cotización", "precio", "报价", "價格", "devis", "prix"],
    answer: "I can help you get a shipping quote! Use our free quote calculator to get an instant estimate based on your cargo dimensions, weight, and destination.",
    actions: [
      { label: "Get a Quote", href: "/quote" },
      { label: "CBM Calculator", href: "/tools/cbm-calculator" },
    ],
  },
  {
    keywords: ["ship", "shipping", "deliver", "transit", "how long", "envío", "enviar", "运输", "發貨", "expédition", "livraison"],
    answer: "We ship from China to the USA via sea freight (LCL & FCL) and air freight. Sea freight takes 25-45 days, air freight 5-10 days. Door-to-door service includes customs clearance.",
    actions: [
      { label: "Get a Quote", href: "/quote" },
      { label: "Our Services", href: "/services" },
      { label: "Track Shipment", href: "/track" },
    ],
  },
  {
    keywords: ["duty", "tariff", "tax", "customs", "section 301", "hts", "arancel", "关税", "關稅", "douane", "droit"],
    answer: "Import duties vary by product (0-48%). Most Chinese goods also face a 25% Section 301 tariff. Use our Revenue Calculator for a complete landed cost breakdown including duties, MPF, HMT, and compliance fees.",
    actions: [
      { label: "Revenue Calculator", href: "/tools/revenue-calculator" },
      { label: "Duty Calculator", href: "/tools/duty-calculator" },
      { label: "Glossary", href: "/glossary" },
    ],
  },
  {
    keywords: ["cbm", "cubic", "volume", "weight", "container", "fit", "size", "dimensión", "体积", "體積", "volume", "conteneur"],
    answer: "CBM (Cubic Meter) is the standard unit for freight volume. Use our CBM Calculator for multi-item calculations with container fit analysis, or try the 3D Visualizer to see how your cargo fits in a container.",
    actions: [
      { label: "CBM Calculator", href: "/tools/cbm-calculator" },
      { label: "3D Visualizer", href: "/tools/3d-visualizer" },
    ],
  },
  {
    keywords: ["product", "catalog", "source", "buy", "find", "furniture", "electronic", "producto", "产品", "產品", "produit", "catalogue"],
    answer: "We source products from China's manufacturing hubs — furniture from Foshan, electronics from Shenzhen, textiles from Guangzhou, and more. Browse our product catalog or get a custom sourcing quote.",
    actions: [
      { label: "Product Catalog", href: "/catalog" },
      { label: "Get a Quote", href: "/quote" },
      { label: "Case Studies", href: "/case-studies" },
    ],
  },
  {
    keywords: ["guide", "whitepaper", "playbook", "learn", "how to", "import", "guía", "指南", "手冊", "guide"],
    answer: "Download our free 50+ page China Sourcing Playbook — it covers factory prices, business models, logistics, customs, and a 90-day action plan. No spam, just the complete guide.",
    actions: [
      { label: "Download Free Guide", href: "/whitepaper" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    keywords: ["track", "tracking", "where", "shipment", "order", "rastreo", "seguimiento", "追踪", "追蹤", "suivi"],
    answer: "You can track your shipment using your tracking ID. Our system shows real-time status updates from factory to doorstep.",
    actions: [
      { label: "Track Shipment", href: "/track" },
      { label: "My Orders", href: "/account/orders" },
    ],
  },
  {
    keywords: ["account", "login", "sign up", "register", "password", "cuenta", "注册", "登录", "帳戶", "compte", "inscription"],
    answer: "Create a free account to save quotes, track orders, download documents, and manage your shipments. Already have an account? Log in to access your dashboard.",
    actions: [
      { label: "Sign Up / Log In", href: "/login" },
      { label: "My Account", href: "/account" },
    ],
  },
  {
    keywords: ["contact", "email", "phone", "call", "talk", "human", "agent", "contacto", "联系", "聯繫", "contacter"],
    answer: "Our team is here to help! You can reach us by email at dogetech77@gmail.com, call us at +1 (425) 223-0449, or fill out our contact form. We typically respond within 1 hour during business hours.",
    actions: [
      { label: "Contact Form", href: "/contact" },
      { label: "Get a Quote", href: "/quote" },
    ],
  },
  {
    keywords: ["about", "company", "who", "location", "office", "acerca", "关于", "關於", "à propos"],
    answer: "Doge Consulting Group Limited operates from Seattle (US operations), Hong Kong (headquarters), and Shenzhen (sourcing). We bridge Chinese manufacturing with North American delivery.",
    actions: [
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    keywords: ["faq", "question", "help", "support", "pregunta", "问题", "問題", "aide"],
    answer: "Check our FAQ for answers to common questions about shipping, customs, sourcing, and payments. If you can't find what you need, our team is happy to help!",
    actions: [
      { label: "FAQ", href: "/faq" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    keywords: ["payment", "pay", "airwallex", "credit card", "wire", "pago", "支付", "付款", "paiement"],
    answer: "We accept major credit/debit cards (Visa, Mastercard, Amex) and bank wire transfers through our secure Airwallex payment system. For large orders, we also support wire transfers with lower processing fees.",
    actions: [
      { label: "Payment Info", href: "/faq" },
      { label: "My Account", href: "/account" },
    ],
  },
  {
    keywords: ["hello", "hi", "hey", "good", "hola", "你好", "bonjour", "salut"],
    answer: "Hello! 👋 I'm Doge's virtual assistant. I can help you with shipping quotes, duty calculations, tracking shipments, finding products, and more. What can I help you with today?",
    actions: [
      { label: "Get a Quote", href: "/quote" },
      { label: "Our Services", href: "/services" },
      { label: "Free Guide", href: "/whitepaper" },
    ],
  },
];

const DEFAULT_RESPONSE: KnowledgeEntry = {
  keywords: [],
  answer: "I'm not sure I can answer that directly, but our team would be happy to help! You can reach us through our contact form or browse our FAQ for common questions.",
  actions: [
    { label: "Contact Us", href: "/contact" },
    { label: "FAQ", href: "/faq" },
    { label: "Get a Quote", href: "/quote" },
  ],
};

function findAnswer(input: string): KnowledgeEntry {
  const lower = input.toLowerCase();
  // Score each entry by how many keywords match
  let bestMatch: KnowledgeEntry | null = null;
  let bestScore = 0;
  for (const entry of KNOWLEDGE) {
    const score = entry.keywords.filter(kw => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }
  return bestMatch || DEFAULT_RESPONSE;
}

interface Message {
  id: number;
  role: "bot" | "user";
  text: string;
  actions?: QuickAction[];
}

let msgId = 0;

export function LiveChat() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: msgId++,
      role: "bot",
      text: "Hi! 👋 I'm Doge's assistant. How can I help you today?",
      actions: [
        { label: "Get a Quote", href: "/quote" },
        { label: "Our Services", href: "/services" },
        { label: "Free Guide", href: "/whitepaper" },
        { label: "Track Shipment", href: "/track" },
      ],
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    // Add user message
    setMessages(prev => [...prev, { id: msgId++, role: "user", text }]);
    setInput("");
    setTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const result = findAnswer(text);
      setMessages(prev => [...prev, { id: msgId++, role: "bot", text: result.answer, actions: result.actions }]);
      setTyping(false);
    }, 600 + Math.random() * 800);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat window */}
      {open && (
        <div className="absolute bottom-16 right-0 w-[340px] sm:w-[380px] rounded-2xl border bg-white shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 flex flex-col" style={{ height: "min(520px, calc(100vh - 120px))" }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-navy to-navy-light p-4 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-sm">Doge Assistant</p>
                <p className="text-[10px] text-slate-300">Online — typically replies instantly</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "bot" && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal/10 mt-1">
                    <Bot className="h-3 w-3 text-teal" />
                  </div>
                )}
                <div className={`max-w-[80%] space-y-2 ${msg.role === "user" ? "order-first" : ""}`}>
                  <div className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-teal text-white rounded-br-md"
                      : "bg-white border shadow-sm rounded-bl-md"
                  }`}>
                    {msg.text}
                  </div>
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {msg.actions.map((action) => (
                        <Link key={action.href} href={action.href} onClick={() => setOpen(false)}>
                          <button className="inline-flex items-center gap-1 rounded-full border bg-white px-3 py-1 text-xs font-medium text-teal hover:bg-teal/5 hover:border-teal/30 transition-colors shadow-sm">
                            {action.label}
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy/10 mt-1">
                    <User className="h-3 w-3 text-navy" />
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div className="flex gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal/10 mt-1">
                  <Bot className="h-3 w-3 text-teal" />
                </div>
                <div className="bg-white border shadow-sm rounded-2xl rounded-bl-md px-4 py-2.5">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick actions for empty state */}
          {messages.length <= 1 && (
            <div className="px-3 pb-2 shrink-0">
              <p className="text-[10px] text-muted-foreground mb-1.5">Quick questions:</p>
              <div className="flex flex-wrap gap-1">
                {["How much does shipping cost?", "What are import duties?", "How to track my order?", "Download free guide"].map((q) => (
                  <button key={q} onClick={() => { setInput(q); }} className="text-[11px] px-2.5 py-1 rounded-full border bg-white hover:bg-teal/5 hover:border-teal/30 text-muted-foreground transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t p-3 shrink-0 bg-white">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 text-sm h-9"
                disabled={typing}
              />
              <Button type="submit" size="sm" className="bg-teal hover:bg-teal/90 h-9 w-9 p-0" disabled={!input.trim() || typing}>
                {typing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setOpen(!open)}
        className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 ${
          open ? "bg-navy text-white hover:bg-navy/90" : "bg-teal text-white hover:bg-teal/90"
        }`}
        aria-label="Chat with us"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
