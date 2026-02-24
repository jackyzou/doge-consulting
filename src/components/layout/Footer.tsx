import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { DogeLogo } from "@/components/ui/doge-logo";

export function Footer() {
  return (
    <footer className="border-t bg-navy text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <DogeLogo size={36} />
              <span className="text-xl font-bold">
                Doge<span className="text-teal">Consulting</span>
              </span>
            </div>
            <p className="text-sm text-slate-300">
              Premium product shipping from mainland China to the USA.
              Door-to-door service with full customs clearance.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-teal">
              Services
            </h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><Link href="/services" className="hover:text-white transition-colors">Sea Freight (LCL)</Link></li>
              <li><Link href="/services" className="hover:text-white transition-colors">Full Container (FCL)</Link></li>
              <li><Link href="/services" className="hover:text-white transition-colors">Product Sourcing</Link></li>
              <li><Link href="/services" className="hover:text-white transition-colors">Customs Clearance</Link></li>
              <li><Link href="/services" className="hover:text-white transition-colors">Last-Mile Delivery</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-teal">
              Company
            </h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/quote" className="hover:text-white transition-colors">Get a Quote</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-teal">
              Contact Us
            </h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-teal" />
                Seattle, WA, USA
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gold" />
                Hong Kong SAR
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-teal" />
                dogetech77@gmail.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-teal" />
                +1 (206) 555-0188
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-700 pt-8 text-center text-sm text-slate-400">
          <p>© {new Date().getFullYear()} Doge Consulting Ltd. All rights reserved. | Hong Kong Registered Company</p>
        </div>
      </div>
    </footer>
  );
}
