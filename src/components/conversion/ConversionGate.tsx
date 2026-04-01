"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Mail, Lock, User, ArrowRight, Sparkles } from "lucide-react";

// ── Conversion Gate Thresholds (CEO approved March 31, 2026) ──
// Blog: 2nd post viewed in session → inline email capture at 45% scroll
// Tools: 2nd use in session → signup dialog
// Gate type: Medium (inline, content continues after email entry)

const BLOG_VIEWS_THRESHOLD = 2; // Show gate on 2nd blog post
const TOOL_USES_THRESHOLD = 2; // Show gate on 2nd tool use
const BLOG_SCROLL_PERCENT = 45; // Show inline gate at 45% scroll on 2nd+ post

// ── Session tracking helpers ──
function getSessionCount(key: string): number {
  if (typeof window === "undefined") return 0;
  return parseInt(sessionStorage.getItem(`doge_${key}`) || "0", 10);
}

function incrementSessionCount(key: string): number {
  if (typeof window === "undefined") return 0;
  const current = getSessionCount(key) + 1;
  sessionStorage.setItem(`doge_${key}`, String(current));
  return current;
}

function isGateDismissed(key: string): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(`doge_gate_dismissed_${key}`) === "1";
}

function dismissGate(key: string) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(`doge_gate_dismissed_${key}`, "1");
  }
}

function isUserLoggedIn(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.includes("doge_session=");
}

// ── Inline Email Capture (for blog posts) ──
export function BlogConversionGate({ postSlug }: { postSlug?: string }) {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isUserLoggedIn() || isGateDismissed("blog")) return;

    const count = incrementSessionCount("blog_views");
    if (count < BLOG_VIEWS_THRESHOLD) return;

    // Show gate at scroll threshold
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent >= BLOG_SCROLL_PERCENT && !show) {
        setShow(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [show, postSlug]);

  const handleSubmit = async () => {
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }
    setError("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok) {
        setSubmitted(true);
        dismissGate("blog");
        // Track conversion
        fetch("/api/track-view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: `/conversion/blog-gate/${postSlug || "unknown"}`, referrer: window.location.pathname }),
        }).catch(() => {});
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
  };

  if (!show || isUserLoggedIn()) return null;

  if (submitted) {
    return (
      <div className="my-10 mx-auto max-w-xl bg-gradient-to-r from-teal/5 to-navy/5 border border-teal/20 rounded-2xl p-8 text-center">
        <Sparkles className="h-8 w-8 text-teal mx-auto mb-3" />
        <p className="font-bold text-lg text-navy">Welcome aboard!</p>
        <p className="text-sm text-muted-foreground mt-2">Check your inbox for a welcome email with a <strong>15% discount code</strong> and our free import playbook.</p>
      </div>
    );
  }

  return (
    <div className="my-10 mx-auto max-w-xl bg-gradient-to-r from-navy/5 to-teal/5 border border-navy/15 rounded-2xl p-8 shadow-lg">
      <div className="text-center mb-5">
        <Badge className="mb-3 bg-teal/10 text-teal border-teal/20 text-xs">Free — No credit card required</Badge>
        <h3 className="text-xl font-bold text-navy">Get the full import playbook + 15% off</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Join 500+ importers getting weekly trade intelligence, tariff alerts, and sourcing tips.
        </p>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="pl-10 h-11"
          />
        </div>
        <Button onClick={handleSubmit} className="bg-teal hover:bg-teal/90 h-11 px-6 gap-1">
          Subscribe <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      <p className="text-[10px] text-muted-foreground text-center mt-3">
        Unsubscribe anytime. We send 1-2 emails per week max.
      </p>
    </div>
  );
}

// ── Tool Usage Gate (signup dialog for calculators) ──
export function ToolConversionGate({ toolName, children }: { toolName: string; children: React.ReactNode }) {
  const [showDialog, setShowDialog] = useState(false);
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [gateTriggered, setGateTriggered] = useState(false);

  const checkToolGate = useCallback(() => {
    if (isUserLoggedIn() || isGateDismissed("tool")) return;

    const count = incrementSessionCount("tool_uses");
    if (count >= TOOL_USES_THRESHOLD && !gateTriggered) {
      setGateTriggered(true);
      setShowDialog(true);
    }
  }, [gateTriggered]);

  // Expose the gate check function via a custom event
  useEffect(() => {
    const handler = () => checkToolGate();
    window.addEventListener("doge-tool-calculate", handler);
    return () => window.removeEventListener("doge-tool-calculate", handler);
  }, [checkToolGate]);

  const handleAuth = async () => {
    if (!email || !password) {
      setError("Email and password required");
      return;
    }
    setLoading(true);
    setError("");

    const endpoint = authMode === "signup" ? "/api/auth/signup" : "/api/auth/login";
    const body = authMode === "signup"
      ? { email, password, name: name || email.split("@")[0] }
      : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (res.ok) {
        setShowDialog(false);
        dismissGate("tool");
        window.dispatchEvent(new Event("auth-changed"));
        // Track conversion
        fetch("/api/track-view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: `/conversion/tool-gate/${toolName}`, referrer: window.location.pathname }),
        }).catch(() => {});
      } else {
        setError(data.error || "Authentication failed");
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  return (
    <>
      {children}

      <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) dismissGate("tool"); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-navy">
              {authMode === "signup" ? "Create your free account" : "Welcome back"}
            </DialogTitle>
            <DialogDescription>
              Save your calculations, get personalized quotes, and access premium tools.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {authMode === "signup" && (
              <div>
                <Label htmlFor="gate-name" className="text-xs text-muted-foreground">Name</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="gate-name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="pl-10" />
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="gate-email" className="text-xs text-muted-foreground">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="gate-email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" />
              </div>
            </div>
            <div>
              <Label htmlFor="gate-password" className="text-xs text-muted-foreground">Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="gate-password" type="password" placeholder="6+ characters" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAuth()} className="pl-10" />
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button onClick={handleAuth} disabled={loading} className="w-full bg-teal hover:bg-teal/90 gap-2">
              {loading ? "..." : authMode === "signup" ? "Create Free Account" : "Log In"}
              <ArrowRight className="h-4 w-4" />
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              {authMode === "signup" ? (
                <>Already have an account? <button onClick={() => setAuthMode("login")} className="text-teal hover:underline">Log in</button></>
              ) : (
                <>Need an account? <button onClick={() => setAuthMode("signup")} className="text-teal hover:underline">Sign up free</button></>
              )}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Helper: Trigger tool gate from calculator pages ──
export function triggerToolGateCheck() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("doge-tool-calculate"));
  }
}

// ── Export thresholds for reference ──
export const CONVERSION_CONFIG = {
  blogViewsThreshold: BLOG_VIEWS_THRESHOLD,
  toolUsesThreshold: TOOL_USES_THRESHOLD,
  blogScrollPercent: BLOG_SCROLL_PERCENT,
  gateType: "medium" as const,
};
