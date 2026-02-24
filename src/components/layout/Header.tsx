"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Ship, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navLinks = [
  { href: "/", label: "Home", labelZh: "首页" },
  { href: "/services", label: "Services", labelZh: "服务" },
  { href: "/quote", label: "Get Quote", labelZh: "获取报价" },
  { href: "/about", label: "About", labelZh: "关于我们" },
  { href: "/faq", label: "FAQ", labelZh: "常见问题" },
  { href: "/contact", label: "Contact", labelZh: "联系我们" },
];

export function Header() {
  const [lang, setLang] = useState<"en" | "zh">("en");
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy text-white">
            <Ship className="h-5 w-5" />
          </div>
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
              {lang === "en" ? link.label : link.labelZh}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === "en" ? "zh" : "en")}
            className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary"
          >
            <Globe className="h-4 w-4" />
            {lang === "en" ? "中文" : "EN"}
          </button>
          <Link href="/quote" className="hidden sm:block">
            <Button className="bg-teal text-white hover:bg-teal/90">
              {lang === "en" ? "Free Quote" : "免费报价"}
            </Button>
          </Link>

          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-4 pt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2 text-base font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    {lang === "en" ? link.label : link.labelZh}
                  </Link>
                ))}
                <Link href="/quote" onClick={() => setOpen(false)}>
                  <Button className="mt-4 w-full bg-teal text-white hover:bg-teal/90">
                    {lang === "en" ? "Get Free Quote" : "获取免费报价"}
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
