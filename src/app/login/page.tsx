"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DogeLogo } from "@/components/ui/doge-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Eye, EyeOff, LogIn, Loader2, UserPlus } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";
  const { t } = useTranslation();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        if (!name) { setError(t("loginPage.nameRequired")); setLoading(false); return; }
        if (password.length < 6) { setError(t("loginPage.passwordMin")); setLoading(false); return; }

        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name, phone: phone || undefined, company: company || undefined, language: localStorage.getItem("locale") || "en" }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || t("loginPage.signupFailed"));
          setLoading(false);
          return;
        }

        // Successful signup → notify header, then redirect
        window.dispatchEvent(new Event("auth-changed"));
        router.push(from.startsWith("/admin") ? "/account" : (from === "/" ? "/account" : from));
        router.refresh();
      } else {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || t("loginPage.loginFailed"));
          setLoading(false);
          return;
        }

        // Notify header of auth change, then redirect based on role
        window.dispatchEvent(new Event("auth-changed"));
        if (data.user.role === "admin") {
          router.push(from.startsWith("/admin") ? from : "/admin");
        } else {
          router.push(from.startsWith("/account") ? from : "/account");
        }
        router.refresh();
      }
    } catch {
      setError(t("loginPage.networkError"));
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-teal-50/30 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-3">
          <div className="flex justify-center">
            <DogeLogo size={48} />
          </div>
          <CardTitle className="text-2xl">{mode === "login" ? t("loginPage.welcomeBack") : t("loginPage.createAccount")}</CardTitle>
          <CardDescription>
            {mode === "login"
              ? t("loginPage.signInDesc")
              : t("loginPage.signUpDesc")}
          </CardDescription>

          {/* Mode Toggle */}
          <div className="flex rounded-lg border p-1 gap-1">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                mode === "login" ? "bg-teal text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("loginPage.signIn")}
            </button>
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(""); }}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                mode === "signup" ? "bg-teal text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("loginPage.signUp")}
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name">{t("loginPage.fullName")}</Label>
                <Input
                  id="name"
                  placeholder={t("loginPage.yourFullName")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t("loginPage.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("loginPage.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus={mode === "login"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("loginPage.password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={mode === "signup" ? t("loginPage.passwordPlaceholderSignup") : "••••••••"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {mode === "signup" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("loginPage.phone")}</Label>
                  <Input
                    id="phone"
                    placeholder={t("loginPage.optional")}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">{t("loginPage.company")}</Label>
                  <Input
                    id="company"
                    placeholder={t("loginPage.optional")}
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-teal hover:bg-teal/90 gap-2"
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" />{mode === "login" ? t("loginPage.signingIn") : t("loginPage.creatingAccount")}</>
              ) : mode === "login" ? (
                <><LogIn className="h-4 w-4" />{t("loginPage.signIn")}</>
              ) : (
                <><UserPlus className="h-4 w-4" />{t("loginPage.createAccount")}</>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Doge Consulting Group Limited</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
