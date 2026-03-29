"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { JsonLd } from "@/components/seo/JsonLd";

const glossary: { term: string; definition: string; category: string }[] = [
  // Documents
  { term: "Bill of Lading (B/L)", definition: "A document issued by a carrier acknowledging receipt of cargo for shipment. It serves as a receipt, contract of carriage, and document of title. Required for every ocean shipment.", category: "Documents" },
  { term: "Commercial Invoice", definition: "A document stating the value, quantity, and description of goods being shipped. Used by customs to assess import duties. Must match the packing list.", category: "Documents" },
  { term: "Packing List", definition: "A detailed breakdown of cargo contents including weights, dimensions, and quantities of each item in a shipment.", category: "Documents" },
  { term: "Certificate of Origin (CO)", definition: "Official document certifying the country where goods were manufactured. Required for duty rate determination and trade agreement eligibility.", category: "Documents" },
  { term: "Proforma Invoice", definition: "A preliminary invoice sent before goods are shipped, used for customs clearance, trade finance, and as a formal price quotation.", category: "Documents" },
  { term: "POD (Proof of Delivery)", definition: "Documentation confirming that goods have been delivered to the consignee at the destination. Used to close out shipments and trigger final payments.", category: "Documents" },
  // Customs
  { term: "Customs Broker", definition: "A licensed professional who handles customs clearance, duty calculations, and regulatory compliance for imported goods. Required for most commercial imports into the US.", category: "Customs" },
  { term: "Customs Duty", definition: "A tax imposed on goods when they cross international borders. Rates depend on the product's HTS code, country of origin, and any applicable trade agreements or tariffs.", category: "Customs" },
  { term: "HTS Code (Harmonized Tariff Schedule)", definition: "A standardized 10-digit numerical system used to classify traded products and determine duty rates. The first 6 digits are internationally standardized.", category: "Customs" },
  { term: "ISF (Importer Security Filing)", definition: "Also called '10+2', a US Customs requirement to file 10 data elements at least 24 hours before cargo is loaded onto a vessel bound for the US. Penalty for non-compliance: $5,000-$10,000.", category: "Customs" },
  { term: "Section 301 Tariffs", definition: "Additional tariffs imposed by the US on Chinese goods (typically 7.5-25%) as part of trade policy. Affect most manufactured goods from China, on top of regular duties.", category: "Customs" },
  { term: "MPF (Merchandise Processing Fee)", definition: "A US Customs fee charged on all imports, calculated at 0.3464% of the goods' value (minimum $31.67, maximum $614.35 per entry).", category: "Customs" },
  { term: "HMT (Harbor Maintenance Tax)", definition: "A US fee of 0.125% of the cargo value, charged on all imports arriving by sea. Used to fund harbor maintenance and dredging.", category: "Customs" },
  { term: "Customs Bond", definition: "A financial guarantee required by CBP for commercial imports over $2,500. Ensures payment of duties and compliance with regulations. Can be single-entry or continuous.", category: "Customs" },
  { term: "Duty Drawback", definition: "A refund of up to 99% of customs duties paid on imported goods that are subsequently exported or destroyed. Useful for re-export businesses.", category: "Customs" },
  { term: "Free Trade Zone (FTZ)", definition: "A designated area where goods can be stored, assembled, or processed without paying customs duties until they enter US commerce. Allows duty deferral and reduction.", category: "Customs" },
  { term: "Anti-Dumping Duty", definition: "An extra tariff on imported goods sold at below fair market value in the exporting country. Common on Chinese steel, aluminum, and certain manufactured goods.", category: "Customs" },
  // Shipping
  { term: "FCL (Full Container Load)", definition: "A shipment that fills an entire container (20ft or 40ft). The shipper rents the whole container regardless of whether it's full. Best for large shipments over 15 CBM.", category: "Shipping" },
  { term: "LCL (Less than Container Load)", definition: "A shipment that doesn't fill an entire container, so it's consolidated with other shippers' cargo. You pay per CBM or per weight ton (whichever is greater).", category: "Shipping" },
  { term: "Consolidation", definition: "Combining multiple smaller shipments from different shippers into one container to reduce per-unit shipping costs. Standard practice for LCL shipments.", category: "Shipping" },
  { term: "Deconsolidation", definition: "The process of breaking down a consolidated container into individual shipments at the destination port for separate delivery.", category: "Shipping" },
  { term: "Door-to-Door", definition: "A shipping service where the freight forwarder handles everything from the seller's location to the buyer's address, including pickup, ocean freight, customs, and last-mile delivery.", category: "Shipping" },
  { term: "Drayage", definition: "Short-distance transport of goods, typically from a port to a warehouse or distribution center, usually by truck. A critical link between ocean freight and inland distribution.", category: "Shipping" },
  { term: "ETA (Estimated Time of Arrival)", definition: "The expected date and time a vessel or shipment will arrive at the destination port. Subject to change due to weather, port congestion, or routing changes.", category: "Shipping" },
  { term: "ETD (Estimated Time of Departure)", definition: "The expected date and time a vessel will depart from the origin port.", category: "Shipping" },
  { term: "Transit Time", definition: "The number of days from when cargo is loaded at the origin port to when it arrives at the destination port. China to US West Coast: 14-20 days; East Coast: 25-35 days.", category: "Shipping" },
  { term: "Transshipment", definition: "When cargo is transferred from one vessel to another at an intermediate port during transit. Common for routes that aren't served by direct shipping lines.", category: "Shipping" },
  { term: "Freight Forwarder", definition: "A company that arranges the transport of goods on behalf of shippers. They coordinate between carriers, customs brokers, warehouses, and the shipper.", category: "Shipping" },
  { term: "Last Mile Delivery", definition: "The final step of the delivery process — transporting goods from a distribution hub or port to the end customer's address. Often the most expensive per-mile segment.", category: "Shipping" },
  { term: "Booking", definition: "Reserving space on a vessel for your cargo. Made through a freight forwarder or directly with a shipping line. Must be done 1-2 weeks before vessel departure.", category: "Shipping" },
  // Measurements
  { term: "CBM (Cubic Meter)", definition: "The standard unit of measurement for ocean freight volume. Calculated as Length × Width × Height in meters. 1 CBM = 1m × 1m × 1m. A 20ft container holds ~33 CBM.", category: "Measurements" },
  { term: "TEU (Twenty-foot Equivalent Unit)", definition: "The standard unit for measuring container ship capacity. One TEU = one 20-foot container. A 40-foot container = 2 TEU. The largest ships carry 24,000+ TEU.", category: "Measurements" },
  { term: "FEU (Forty-foot Equivalent Unit)", definition: "A 40-foot shipping container — the most common size for international cargo. 1 FEU = 2 TEU. Capacity: ~67 CBM, max payload ~26,500 kg. Freight rates are typically quoted per FEU (e.g., '$2,950/FEU' for Shenzhen→LA). The per-CBM cost of a 40ft container is 15-25% lower than a 20ft, making FEU the preferred choice for most China-to-US shipments.", category: "Measurements" },
  { term: "Volumetric Weight", definition: "A pricing technique: L × W × H ÷ 6,000 (in cm) for air, ÷ 5,000 for express. The chargeable weight is the greater of actual weight or volumetric weight.", category: "Measurements" },
  { term: "Gross Weight", definition: "The total weight of goods including packaging, pallets, and containers. Used for shipping calculations and vessel loading.", category: "Measurements" },
  { term: "Tare Weight", definition: "The weight of an empty container. A standard 20ft container has a tare weight of approximately 2,300 kg.", category: "Measurements" },
  // Incoterms
  { term: "FOB (Free on Board)", definition: "An Incoterm where the seller is responsible until goods are loaded onto the vessel at the origin port. The buyer pays for ocean freight, insurance, and customs from that point. Most common for China imports.", category: "Incoterms" },
  { term: "CIF (Cost, Insurance & Freight)", definition: "An Incoterm where the seller pays for shipping and insurance to the destination port. The buyer takes risk once goods are loaded on the vessel and handles customs.", category: "Incoterms" },
  { term: "EXW (Ex Works)", definition: "An Incoterm where the buyer assumes all responsibility from the seller's factory door. The buyer arranges and pays for all transport, insurance, and customs.", category: "Incoterms" },
  { term: "DDP (Delivered Duty Paid)", definition: "An Incoterm where the seller handles everything including customs clearance and duty payment at the destination. Maximum responsibility for the seller.", category: "Incoterms" },
  { term: "DAP (Delivered at Place)", definition: "An Incoterm where the seller delivers goods to the buyer's specified location, but the buyer handles customs clearance and duty payment.", category: "Incoterms" },
  // Costs
  { term: "Demurrage", definition: "Charges for keeping a container at the port beyond the allotted free time (typically 3-5 days). Can be $100-$300 per day. Avoid by picking up containers promptly.", category: "Costs" },
  { term: "Detention", definition: "Charges for keeping a container outside the port/terminal beyond the free time. Applied when you haven't returned the empty container after unloading.", category: "Costs" },
  { term: "Landed Cost", definition: "The total cost of getting a product to your door: product cost + shipping + insurance + duties + customs broker fees + drayage + handling. The true basis for pricing decisions.", category: "Costs" },
  { term: "FOB Price", definition: "The price of goods loaded onto the vessel at the Chinese port. Includes factory cost, inland transport to port, and export customs. The starting point for your cost calculation.", category: "Costs" },
  // Sourcing
  { term: "MOQ (Minimum Order Quantity)", definition: "The smallest number of units a factory will produce in one order. Typically 100-5,000 units depending on the product. Can sometimes be negotiated, especially for repeat orders.", category: "Sourcing" },
  { term: "OEM (Original Equipment Manufacturer)", definition: "A factory that manufactures products designed by another company. You provide the design/specs, they produce it. Common for branded products.", category: "Sourcing" },
  { term: "ODM (Original Design Manufacturer)", definition: "A factory that designs and manufactures products that other companies rebrand and sell. You choose from their catalog and add your branding.", category: "Sourcing" },
  { term: "Private Label", definition: "Products manufactured by one company and sold under another company's brand. Common on Amazon — you find a product, add your logo and packaging, and sell it.", category: "Sourcing" },
  { term: "Trading Company", definition: "A middleman that sources products from multiple factories and sells to international buyers. May have higher prices than direct factory but offer convenience and lower MOQ.", category: "Sourcing" },
  { term: "Canton Fair", definition: "The China Import and Export Fair, held in Guangzhou in April and October. World's largest trade fair with 25,000+ exhibitors. The best place to meet Chinese manufacturers in person.", category: "Sourcing" },
  { term: "Alibaba", definition: "The world's largest B2B e-commerce platform connecting Chinese manufacturers with international buyers. Over 200,000 suppliers. Use 'Verified Manufacturer' and 'Trade Assurance' filters.", category: "Sourcing" },
  { term: "1688.com", definition: "China's domestic B2B wholesale platform (owned by Alibaba). Often 20-40% cheaper than Alibaba.com but requires a Chinese agent. Great for finding real factory prices.", category: "Sourcing" },
  { term: "Quality Inspection (QC)", definition: "Third-party inspection of goods at the factory before shipping. Typically uses AQL 2.5 sampling standard. Services like QIMA, V-Trust cost $200-$500 per inspection.", category: "Sourcing" },
  { term: "AQL (Acceptable Quality Level)", definition: "A statistical standard for quality inspection sampling. AQL 2.5 is standard for consumer goods — inspecting a random sample from a batch to determine overall quality.", category: "Sourcing" },
  { term: "Tech Pack", definition: "A detailed technical specification document for a product, including materials, dimensions, colors, packaging, and labeling requirements. Essential for custom manufacturing.", category: "Sourcing" },
  // Business
  { term: "Amazon FBA", definition: "Fulfillment by Amazon — a service where you send inventory to Amazon's warehouses and they handle storage, picking, packing, shipping, and customer service. Pairs well with China sourcing.", category: "Business" },
  { term: "Dropshipping", definition: "A business model where you sell products without holding inventory. When a customer orders, you purchase from a supplier who ships directly to the customer. Low risk but low margin.", category: "Business" },
  { term: "SEZ (Special Economic Zone)", definition: "Designated areas in China with tax incentives and simplified regulations to attract foreign investment. Shenzhen, Xiamen, Zhuhai, Shantou, and Hainan are major SEZs.", category: "Business" },
  { term: "HS Code (Harmonized System)", definition: "The international 6-digit product classification system used by customs authorities worldwide. The US adds 4 more digits for the 10-digit HTS code.", category: "Business" },
  { term: "Trade Assurance", definition: "Alibaba's buyer protection program that guarantees product quality and on-time delivery. If the supplier fails, Alibaba refunds your payment. Recommended for first-time buyers.", category: "Business" },
  { term: "RMB/CNY (Chinese Yuan)", definition: "China's official currency. Exchange rate approximately 7.2 CNY = 1 USD (2026). Factory prices in China are often quoted in RMB.", category: "Business" },
  { term: "Wire Transfer (T/T)", definition: "Telegraphic Transfer — the most common payment method for Chinese suppliers. Typical terms: 30% deposit by T/T, 70% balance before shipping. Use Trade Assurance for new suppliers.", category: "Business" },
  { term: "Letter of Credit (L/C)", definition: "A bank guarantee of payment upon presentation of shipping documents. Provides security for both buyer and seller. Common for large orders ($50K+). Bank fees: 1-3% of value.", category: "Business" },
];

export default function GlossaryPage() {
  const { t } = useTranslation();
  const categories = [...new Set(glossary.map((g) => g.category))].sort();

  // Generate DefinedTerm schema for all glossary terms
  const definedTermSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "Shipping & Import Glossary",
    description: "Comprehensive glossary of international shipping, customs, and China import terminology.",
    url: "https://doge-consulting.com/glossary",
    hasDefinedTerm: glossary.map(g => ({
      "@type": "DefinedTerm",
      name: g.term,
      description: g.definition,
      inDefinedTermSet: "https://doge-consulting.com/glossary",
    })),
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <JsonLd data={definedTermSchema} />
      <section className="gradient-hero py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <Badge className="mb-4 bg-teal/20 text-teal-200 border-teal/30"><BookOpen className="h-3 w-3 mr-1" /> {t("headerTools.glossary")}</Badge>
          <h1 className="text-4xl font-bold mb-4">{t("headerTools.glossary")}</h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">{t("headerTools.glossaryDesc")}</p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <a key={cat} href={`#${cat.toLowerCase().replace(/\s/g, "-")}`}>
              <Badge variant="outline" className="cursor-pointer hover:bg-teal/10 hover:border-teal transition-colors">{cat} ({glossary.filter(g => g.category === cat).length})</Badge>
            </a>
          ))}
        </div>

        <div className="space-y-10">
          {categories.map((cat) => (
            <div key={cat} id={cat.toLowerCase().replace(/\s/g, "-")}>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><span className="h-1 w-8 bg-teal rounded-full" />{cat}</h2>
              <div className="space-y-3">
                {glossary.filter((g) => g.category === cat).map((g) => (
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

        <div className="mt-16 text-center p-8 rounded-2xl bg-gradient-to-r from-teal/5 to-gold/5 border">
          <h2 className="text-2xl font-bold mb-3">{t("servicesPage.ctaTitle")}</h2>
          <p className="text-muted-foreground mb-6">{t("servicesPage.ctaSubtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quote"><Button size="lg" className="bg-teal hover:bg-teal/90">Get Free Quote <ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
            <Link href="/whitepaper"><Button size="lg" variant="outline">Download Free Guide 📘</Button></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
