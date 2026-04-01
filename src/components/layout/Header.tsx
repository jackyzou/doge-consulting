"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, Package, Settings, ArrowLeft,
  ShoppingCart, Users, FileDown, LogOut, Loader2, Menu, X,
  ChevronDown, LogIn, User, BookOpen, Calculator, PenLine,
  GraduationCap, TrendingUp, MessageSquare, Ship, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DogeLogo } from "@/components/ui/doge-logo";
import { useTranslation, LOCALES } from "@/lib/i18n";

interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
}

export function Header() {
  const { t, locale, setLocale } = useTranslation();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fetch auth status
  const checkAuth = useCallback(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        setUser(data.user ?? null);
      })
      .catch(() => { setUser(null); })
      .finally(() => setAuthChecked(true));
  }, []);

  // Re-check auth on route changes
  useEffect(() => { checkAuth(); }, [pathname, checkAuth]);

  // Listen for custom auth-changed event (fired from login/signup pages)
  useEffect(() => {
    const handler = () => checkAuth();
    window.addEventListener("auth-changed", handler);
    return () => window.removeEventListener("auth-changed", handler);
  }, [checkAuth]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (resourcesRef.current && !resourcesRef.current.contains(e.target as Node)) {
        setResourcesOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setUserMenuOpen(false);
    window.location.href = "/";
  };

  const currentLocale = LOCALES.find((l) => l.code === locale) || LOCALES[0];

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/services", label: t("nav.services") },
    { href: "/catalog", label: t("nav.catalog") },
    { href: "/quote", label: t("nav.quote") },
    { href: "/about", label: t("nav.about") },
    { href: "/contact", label: t("nav.contact") },
  ];

  const resourceLinks = [
    { href: "/tools/product-matcher", label: "AI Product Matcher", icon: Sparkles, desc: "Find products cheaper from China" },
    { href: "/blog", label: t("headerTools.blog"), icon: PenLine, desc: t("headerTools.blogDesc") },
    { href: "/whitepaper", label: t("headerTools.freeGuide"), icon: BookOpen, desc: t("headerTools.freeGuideDesc") },
    { href: "/tools/revenue-calculator", label: t("headerTools.revenueCalc"), icon: TrendingUp, desc: t("headerTools.revenueCalcDesc") },
    { href: "/tools/cbm-calculator", label: t("headerTools.cbmCalc"), icon: Package, desc: t("headerTools.cbmCalcDesc") },
    { href: "/tools/3d-visualizer", label: t("headerTools.visualizer"), icon: Package, desc: t("headerTools.visualizerDesc") },
    { href: "/tools/shipping-tracker", label: t("headerTools.vesselMap"), icon: Ship, desc: t("headerTools.vesselMapDesc") },
    { href: "/tools/vessel-tracker", label: t("headerTools.containerTracker"), icon: Ship, desc: t("headerTools.containerTrackerDesc") },
    { href: "/tools/duty-calculator", label: t("headerTools.dutyCalc"), icon: Calculator, desc: t("headerTools.dutyCalcDesc") },
    { href: "/glossary", label: t("headerTools.glossary"), icon: GraduationCap, desc: t("headerTools.glossaryDesc") },
    { href: "/case-studies", label: t("headerTools.caseStudies"), icon: TrendingUp, desc: t("headerTools.caseStudiesDesc") },
    { href: "/faq", label: t("nav.faq"), icon: MessageSquare, desc: t("headerTools.faqDesc") },
  ];

  const [resourcesOpen, setResourcesOpen] = useState(false);
  const resourcesRef = useRef<HTMLDivElement>(null);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <DogeLogo size={36} />
          <span className="text-xl font-bold text-navy">
            Doge<span className="text-teal">Consulting</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          {/* Resources Dropdown */}
          <div className="relative" ref={resourcesRef}>
            <button
              onClick={() => setResourcesOpen(!resourcesOpen)}
              onMouseEnter={() => setResourcesOpen(true)}
              className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {t("headerTools.tools")}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${resourcesOpen ? "rotate-180" : ""}`} />
            </button>
            {resourcesOpen && (
              <div
                className="absolute left-0 top-full mt-1 w-72 rounded-lg border bg-white py-2 shadow-xl z-50"
                onMouseLeave={() => setResourcesOpen(false)}
              >
                {resourceLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setResourcesOpen(false)}
                    className="flex items-start gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-secondary"
                  >
                    <item.icon className="h-4 w-4 text-teal mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary"
            >
              <span>{currentLocale.flag}</span>
              <span className="hidden sm:inline">{currentLocale.name}</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${langOpen ? "rotate-180" : ""}`} />
            </button>

            {langOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 rounded-lg border bg-white py-1 shadow-lg z-50">
                {LOCALES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLocale(l.code);
                      setLangOpen(false);
                    }}
                    className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-secondary ${
                      l.code === locale ? "bg-teal/5 font-medium text-teal" : "text-foreground"
                    }`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auth: Login / User Menu */}
          {authChecked && (
            user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal/10 text-teal text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border bg-white py-1 shadow-lg z-50">
                    <div className="px-3 py-2 border-b">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Link
                      href={user.role === "admin" ? "/admin" : "/account"}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-secondary"
                    >
                      <User className="h-4 w-4" />
                      {user.role === "admin" ? t("header.adminPanel") : t("header.myAccount")}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      {t("header.signOut")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="hidden sm:block">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <LogIn className="h-4 w-4" />
                  {t("header.signIn")}
                </Button>
              </Link>
            )
          )}

          <Link href="/quote" className="hidden sm:block">
            <Button className="bg-teal text-white hover:bg-teal/90">
              {t("nav.freeQuote")}
            </Button>
          </Link>

          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 overflow-y-auto">
              <div className="flex flex-col gap-2 pt-6 pb-8">
                {/* Main nav */}
                <div className="space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={`block rounded-lg px-4 py-2.5 text-base font-medium transition-colors hover:bg-secondary ${pathname === link.href ? "bg-teal/5 text-teal" : "text-foreground"}`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                {/* Tools & Resources */}
                <div className="border-t pt-3 mt-2">
                  <p className="px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("headerTools.tools")} &amp; Resources</p>
                  <div className="space-y-0.5 mt-1">
                    {resourceLinks.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-4 py-2 text-sm transition-colors hover:bg-secondary ${pathname === item.href ? "bg-teal/5 font-medium text-teal" : "text-foreground"}`}
                      >
                        <item.icon className="h-4 w-4 text-teal shrink-0" />
                        <div>
                          <p className="font-medium text-sm">{item.label}</p>
                          <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* CTA buttons */}
                <div className="border-t pt-3 mt-2 space-y-2">
                  <Link href="/quote" onClick={() => setOpen(false)}>
                    <Button className="w-full bg-teal text-white hover:bg-teal/90">
                      {t("nav.getFreeQuote")}
                    </Button>
                  </Link>
                  {user ? (
                    <>
                      <Link
                        href={user.role === "admin" ? "/admin" : "/account"}
                        onClick={() => setOpen(false)}
                      >
                        <Button variant="outline" className="w-full gap-2">
                          <User className="h-4 w-4" />
                          {user.role === "admin" ? t("header.adminPanel") : t("header.myAccount")}
                        </Button>
                      </Link>
                      <button
                        onClick={() => { setOpen(false); handleLogout(); }}
                        className="w-full rounded-lg px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 flex items-center justify-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        {t("header.signOut")}
                      </button>
                    </>
                  ) : (
                    <Link href="/login" onClick={() => setOpen(false)}>
                      <Button variant="outline" className="w-full gap-2">
                        <LogIn className="h-4 w-4" />
                        {t("header.signInSignUp")}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
