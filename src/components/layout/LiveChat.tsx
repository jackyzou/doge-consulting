"use client";

import { useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { MessageCircle, X, Mail, Phone, FileText } from "lucide-react";

function ContactBubble() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="absolute bottom-16 right-0 w-72 rounded-xl border bg-white shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="bg-teal p-4 text-white">
            <h3 className="font-bold">Need Help?</h3>
            <p className="text-sm text-teal-100">We typically respond within 1 hour</p>
          </div>
          <div className="p-3 space-y-1">
            <Link href="/contact" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors">
              <Mail className="h-4 w-4 text-teal" />
              <div><p className="text-sm font-medium">Send a Message</p><p className="text-xs text-muted-foreground">Contact form</p></div>
            </Link>
            <a href="mailto:dogetech77@gmail.com" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors">
              <Mail className="h-4 w-4 text-teal" />
              <div><p className="text-sm font-medium">Email Us</p><p className="text-xs text-muted-foreground">dogetech77@gmail.com</p></div>
            </a>
            <a href="tel:+14252230449" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors">
              <Phone className="h-4 w-4 text-teal" />
              <div><p className="text-sm font-medium">Call Us</p><p className="text-xs text-muted-foreground">+1 (425) 223-0449</p></div>
            </a>
            <Link href="/quote" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors">
              <FileText className="h-4 w-4 text-teal" />
              <div><p className="text-sm font-medium">Get a Quote</p><p className="text-xs text-muted-foreground">Free, no obligation</p></div>
            </Link>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-teal text-white shadow-lg hover:bg-teal/90 transition-all hover:scale-105"
        aria-label="Contact us"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}

export function LiveChat() {
  const propertyId = process.env.NEXT_PUBLIC_TAWKTO_PROPERTY_ID;
  const widgetId = process.env.NEXT_PUBLIC_TAWKTO_WIDGET_ID || "1i0";

  // If Tawk.to is configured, use it
  if (propertyId) {
    return (
      <Script
        id="tawk-to"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
            (function(){
              var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
              s1.async=true;
              s1.src='https://embed.tawk.to/${propertyId}/${widgetId}';
              s1.charset='UTF-8';
              s1.setAttribute('crossorigin','*');
              s0.parentNode.insertBefore(s1,s0);
            })();
          `,
        }}
      />
    );
  }

  // Fallback: built-in contact bubble
  return <ContactBubble />;
}
