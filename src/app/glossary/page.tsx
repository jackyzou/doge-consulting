import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Freight & Shipping Glossary | Doge Consulting",
  description: "A comprehensive glossary of freight, shipping, and international trade terms for importers.",
};

const glossary: { term: string; definition: string; category: string }[] = [
  { term: "B/L (Bill of Lading)", definition: "A document issued by a carrier to a shipper, acknowledging receipt of cargo for shipment. It serves as a receipt, contract of carriage, and document of title.", category: "Documents" },
  { term: "CBM (Cubic Meter)", definition: "The standard unit of measurement for ocean freight volume. Calculated as Length × Width × Height in meters. 1 CBM = 1m × 1m × 1m.", category: "Measurements" },
  { term: "CIF (Cost, Insurance & Freight)", definition: "An Incoterm where the seller pays for shipping and insurance to the destination port. The buyer takes risk once goods are loaded on the vessel.", category: "Incoterms" },
  { term: "Consolidation", definition: "Combining multiple smaller shipments from different shippers into one container to reduce costs. Common in LCL shipping.", category: "Shipping" },
  { term: "Customs Broker", definition: "A licensed professional who handles customs clearance, duty calculations, and regulatory compliance for imported goods.", category: "Customs" },
  { term: "Customs Duty", definition: "A tax imposed on goods when they cross international borders. Rates depend on the product's HTS code and country of origin.", category: "Customs" },
  { term: "Demurrage", definition: "Charges for keeping a container at the port beyond the allotted free time (typically 3-5 days). Can be $100-$300 per day.", category: "Costs" },
  { term: "Detention", definition: "Charges for keeping a container outside the port/terminal beyond the free time. Applied when you haven't returned the empty container.", category: "Costs" },
  { term: "Door-to-Door", definition: "A shipping service where the freight forwarder handles everything from the seller's location to the buyer's address, including pickup, shipping, customs, and delivery.", category: "Shipping" },
  { term: "Drayage", definition: "The short-distance transport of goods, typically from a port to a warehouse or vice versa, usually by truck.", category: "Shipping" },
  { term: "ETA (Estimated Time of Arrival)", definition: "The expected date and time a vessel or shipment will arrive at the destination port.", category: "Shipping" },
  { term: "FCL (Full Container Load)", definition: "A shipment that fills an entire container (20ft or 40ft). Best for large shipments — you pay per container regardless of fill level.", category: "Shipping" },
  { term: "FOB (Free on Board)", definition: "An Incoterm where the seller is responsible until goods are loaded onto the vessel. The buyer pays for freight and insurance from that point.", category: "Incoterms" },
  { term: "Freight Forwarder", definition: "A company that arranges the transport of goods on behalf of shippers. They coordinate between carriers, customs, and the shipper.", category: "Industry" },
  { term: "HTS Code", definition: "Harmonized Tariff Schedule code — a standardized numerical system used worldwide to classify traded products and determine duty rates.", category: "Customs" },
  { term: "Incoterms", definition: "International Commercial Terms — a set of 11 rules published by the ICC that define buyer and seller responsibilities in international trade.", category: "Incoterms" },
  { term: "ISF (Importer Security Filing)", definition: "Also called '10+2', a US Customs requirement to file shipment details at least 24 hours before cargo is loaded onto a vessel bound for the US.", category: "Customs" },
  { term: "Last Mile Delivery", definition: "The final step of the delivery process — transporting goods from a distribution hub or port to the end customer's address.", category: "Shipping" },
  { term: "LCL (Less than Container Load)", definition: "A shipment that doesn't fill an entire container, so it's consolidated with other shippers' cargo. You pay per CBM or weight.", category: "Shipping" },
  { term: "MPF (Merchandise Processing Fee)", definition: "A US Customs fee charged on all imports, calculated at 0.3464% of the goods' value (min $31.67, max $614.35 per entry).", category: "Customs" },
  { term: "POD (Proof of Delivery)", definition: "Documentation confirming that goods have been delivered to the consignee at the destination.", category: "Documents" },
  { term: "Section 301 Tariffs", definition: "Additional tariffs imposed by the US on Chinese goods (typically 7.5-25%) as part of trade policy. Rates vary by product category and change over time.", category: "Customs" },
  { term: "TEU (Twenty-foot Equivalent Unit)", definition: "The standard unit for measuring container ship capacity. One TEU = one 20-foot container. A 40-foot container = 2 TEU.", category: "Measurements" },
  { term: "Transit Time", definition: "The number of days from when cargo is loaded at the origin port to when it arrives at the destination port. Excludes inland transport.", category: "Shipping" },
  { term: "Volumetric Weight", definition: "A pricing technique used in shipping: L × W × H ÷ 6,000 (in cm). The chargeable weight is the greater of actual weight or volumetric weight.", category: "Measurements" },
];

export default function GlossaryPage() {
  const categories = [...new Set(glossary.map((g) => g.category))].sort();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="gradient-hero py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <Badge className="mb-4 bg-teal/20 text-teal-200 border-teal/30">
            <BookOpen className="h-3 w-3 mr-1" /> Resource
          </Badge>
          <h1 className="text-4xl font-bold mb-4">Freight & Shipping Glossary</h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Everything you need to know about international shipping, customs, and trade terminology.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Category nav */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <a key={cat} href={`#${cat.toLowerCase()}`}>
              <Badge variant="outline" className="cursor-pointer hover:bg-teal/10 hover:border-teal transition-colors">
                {cat}
              </Badge>
            </a>
          ))}
        </div>

        {/* Terms by category */}
        <div className="space-y-10">
          {categories.map((cat) => (
            <div key={cat} id={cat.toLowerCase()}>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="h-1 w-8 bg-teal rounded-full" />
                {cat}
              </h2>
              <div className="space-y-3">
                {glossary
                  .filter((g) => g.category === cat)
                  .map((g) => (
                    <Card key={g.term}>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-teal">{g.term}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{g.definition}</p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center p-8 rounded-2xl bg-gradient-to-r from-teal/5 to-gold/5 border">
          <h2 className="text-2xl font-bold mb-3">Need Help With Your Shipment?</h2>
          <p className="text-muted-foreground mb-6">
            Don&apos;t worry about memorizing these terms — our team handles everything for you.
          </p>
          <Link href="/quote">
            <Button size="lg" className="bg-teal hover:bg-teal/90">
              Get Free Quote <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
