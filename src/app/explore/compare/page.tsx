"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/navigation/Navbar";
import { db } from "@/lib/db/store";
import { Product } from "@/lib/db/mockData";
import { ArrowLeft, Check, ShoppingCart, RefreshCw, X, ShieldAlert } from "lucide-react";
import { useCart } from "@/hooks/useCart";

// Comprehensive details comparing Canon and Nikon systems
const COMPARATIVE_SPECS: Record<string, Record<string, string>> = {
  "p1000000-0000-0000-0000-000000000001": {
    photo_quality: "Elite (45MP Dual Pixel RAW)",
    video_quality: "High (8K DCI RAW up to 30fps)",
    resolution: "45 Megapixels (Full-Frame CMOS)",
    low_light: "Superb (Dual Native ISO up to 51200)",
    battery: "LP-E6NH (~320 exposures per charge)",
    weight: "738 grams (Including battery and card)",
    best_use: "Studio Commercials, Weddings, High-end Fashion",
    recommendation: "Best for Photography / Portraiture"
  },
  "p1000000-0000-0000-0000-000000000003": {
    photo_quality: "Stunning (45.7MP Stacked CMOS RAW)",
    video_quality: "Elite (8.3K N-RAW up to 60fps)",
    resolution: "45.7 Megapixels (Stacked Sensor)",
    low_light: "Exceptional (Zero Rolling Shutter)",
    battery: "EN-EL15c (~340 exposures per charge)",
    weight: "910 grams (Heavy-duty weather sealed)",
    best_use: "Action Wildlife, Sports, High Frame Rate Cinema",
    recommendation: "Best for Video & High-Speed Action"
  }
};

function ComparePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const idsParam = searchParams.get("ids") || "";

  const { addToCart, cart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState<Record<string, { available: boolean; qty: number }>>({});

  useEffect(() => {
    const fetchCompared = async () => {
      setLoading(true);
      if (idsParam) {
        const idList = idsParam.split(",");
        const fetched: Product[] = [];
        const availMap: Record<string, { available: boolean; qty: number }> = {};
        
        for (const id of idList) {
          const prod = await db.getProductById(id);
          if (prod) {
            fetched.push(prod);
            // Query live availability for default dates
            const status = await db.checkAvailability(prod.id, "2026-07-20", "2026-07-23");
            availMap[prod.id] = { available: status.available, qty: status.remainingQty };
          }
        }
        setProducts(fetched);
        setAvailability(availMap);
      }
      setLoading(false);
    };

    fetchCompared();
  }, [idsParam]);

  const handleRemove = (productId: string) => {
    const remaining = products.filter((p) => p.id !== productId);
    if (remaining.length === 0) {
      router.push("/explore");
    } else {
      router.push(`/explore/compare?ids=${remaining.map((p) => p.id).join(",")}`);
    }
  };

  const handleBook = (product: Product) => {
    addToCart(product, 1, "2026-07-20", "2026-07-23", []);
    router.push("/booking");
  };

  // Static list of specification comparisons
  const specCompareKeys = [
    { key: "photo_quality", label: "Photo Quality" },
    { key: "video_quality", label: "Video Quality" },
    { key: "resolution", label: "Sensor Resolution" },
    { key: "low_light", label: "Low Light ISO Range" },
    { key: "battery", label: "Battery Life" },
    { key: "weight", label: "System Weight" },
    { key: "best_use", label: "Best Use Case" },
  ];

  return (
    <div className="min-h-screen bg-obsidian text-ivory pb-20">
      <Navbar cartItemCount={cart.length} />

      <div className="pt-32 pb-6 px-6 md:px-12 max-w-7xl mx-auto flex items-center justify-between border-b border-white/5">
        <div className="space-y-1">
          <Link href="/explore" className="inline-flex items-center gap-1 text-xs text-gold-champagne hover:underline mb-2">
            <ArrowLeft size={12} /> Back to Catalog
          </Link>
          <h1 className="serif-heading text-3xl md:text-4xl font-light text-ivory">
            Compare <span className="text-gold">Equipment Specifications</span>
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
        
        {/* Recommendation Cards */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="glass-panel border-white/5 p-5 rounded-lg flex flex-col justify-between">
              <div>
                <span className="text-[8px] font-mono uppercase text-gold-champagne tracking-widest">AUREVIA CHOICE</span>
                <h4 className="serif-heading text-base font-semibold text-ivory mt-1">Best for Photography</h4>
                <p className="text-xs text-muted-gray mt-1 leading-normal font-light">The Canon EOS R5 provides dual pixel autofocus and high resolution 45MP RAW frames optimized for portraits & fashion.</p>
              </div>
              <span className="text-xs text-gold-champagne font-semibold mt-3">Featured Recommendation: Canon EOS R5</span>
            </div>
            <div className="glass-panel border-white/5 p-5 rounded-lg flex flex-col justify-between">
              <div>
                <span className="text-[8px] font-mono uppercase text-gold-champagne tracking-widest">AUREVIA CHOICE</span>
                <h4 className="serif-heading text-base font-semibold text-ivory mt-1">Best for Video & Action</h4>
                <p className="text-xs text-muted-gray mt-1 leading-normal font-light">The Nikon Z8 is a powerhouse of cinematic video, offering 8.3K raw and zero rolling shutter for high speed panning shots.</p>
              </div>
              <span className="text-xs text-gold-champagne font-semibold mt-3">Featured Recommendation: Nikon Z8</span>
            </div>
            <div className="glass-panel border-[#D8B36A]/20 p-5 rounded-lg flex flex-col justify-between bg-gold-champagne/5">
              <div>
                <span className="text-[8px] font-mono uppercase text-gold-champagne tracking-widest">LIVE INVENTORY STATUS</span>
                <h4 className="serif-heading text-base font-semibold text-ivory mt-1">Best Available Option</h4>
                <p className="text-xs text-muted-gray mt-1 leading-normal font-light">Check which systems are currently stocked in our Gadag studio database for immediate pickup.</p>
              </div>
              <span className="text-xs text-gold-champagne font-semibold mt-3">
                {availability["p1000000-0000-0000-0000-000000000001"]?.available ? "Canon R5 Available" : availability["p1000000-0000-0000-0000-000000000003"]?.available ? "Nikon Z8 Available" : "All Cameras Currently Booked"}
              </span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 font-mono text-xs text-muted-gray">
            <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-gold-champagne" />
            COMPILING COMPARISON VAULT...
          </div>
        ) : products.length === 0 ? (
          <div className="glass-panel border-white/5 rounded-lg p-16 text-center">
            <p className="text-xs text-muted-gray mb-4">No products selected for comparison.</p>
            <Link
              href="/explore"
              className="px-6 py-2.5 bg-gold-champagne text-obsidian text-xs font-bold uppercase tracking-wider rounded hover:bg-gold-warm transition"
            >
              Explore Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
            
            {/* Spec Labels Column (Visible on Desktop) */}
            <div className="hidden md:flex flex-col justify-end pb-4 font-mono text-[10px] text-muted-gray uppercase tracking-widest space-y-6">
              <div className="h-[280px] flex items-end pb-8 border-b border-white/5 font-semibold text-xs text-gold-champagne">
                Core Metrics
              </div>
              <div className="py-2.5">Daily Rental Price</div>
              <div className="py-2.5">Live Availability (Jul 20-23)</div>

              {specCompareKeys.map((item) => (
                <div key={item.key} className="py-2.5 border-b border-white/5 truncate">
                  {item.label}
                </div>
              ))}
            </div>

            {/* Compared Product Columns */}
            {products.map((product) => {
              const compSpecs = COMPARATIVE_SPECS[product.id] || {};
              const avail = availability[product.id] || { available: false, qty: 0 };
              
              return (
                <div
                  key={product.id}
                  className="glass-panel border-white/5 hover:border-gold-border/30 rounded-lg p-5 flex flex-col justify-between relative transition duration-300"
                >
                  {/* Remove button */}
                  <button
                    onClick={() => handleRemove(product.id)}
                    className="absolute top-3 right-3 text-muted-gray hover:text-rose-400 transition cursor-pointer"
                    title="Remove from comparison"
                  >
                    <X size={15} />
                  </button>

                  <div className="space-y-6">
                    {/* Image and Header */}
                    <div className="h-[280px] flex flex-col justify-between border-b border-white/5 pb-6">
                      <div className="h-36 overflow-hidden rounded bg-black/30 border border-white/5 flex items-center justify-center mb-4">
                        <img src={product.imagePrimary} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] font-mono uppercase text-gold-champagne tracking-widest">★ {product.rating} Rating</span>
                        <h3 className="serif-heading text-lg font-light text-ivory leading-tight truncate">{product.name}</h3>
                      </div>
                    </div>

                    {/* Pricing Matrix */}
                    <div className="space-y-4">
                      <div className="py-1">
                        <span className="md:hidden text-[8px] text-muted-gray uppercase block font-mono">Daily Price</span>
                        <span className="text-sm font-semibold text-gold-champagne">₹{product.dailyPrice.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="py-1">
                        <span className="md:hidden text-[8px] text-muted-gray uppercase block font-mono">Availability</span>
                        {avail.available ? (
                          <span className="text-[10px] text-emerald-400 font-mono uppercase bg-emerald-400/5 px-2 py-0.5 border border-emerald-400/20 rounded">
                            Available ({avail.qty} units)
                          </span>
                        ) : (
                          <span className="text-[10px] text-rose-400 font-mono uppercase bg-rose-400/5 px-2 py-0.5 border border-rose-400/20 rounded">
                            Fully Booked
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Specs List */}
                    <div className="space-y-4 font-sans text-xs">
                      {specCompareKeys.map((item) => {
                        const value = compSpecs[item.key] || product.specs[item.key] || "—";
                        return (
                          <div key={item.key} className="py-1 border-b border-white/5 flex flex-col md:block">
                            <span className="md:hidden text-[8px] text-muted-gray uppercase font-mono block mb-0.5">{item.label}</span>
                            <span className="text-ivory font-light block">{value}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Direct CTA */}
                  <div className="pt-8">
                    <button
                      onClick={() => handleBook(product)}
                      disabled={!avail.available}
                      className={`w-full py-3 text-xs font-bold uppercase tracking-wider rounded transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg ${
                        avail.available
                          ? "bg-gold-champagne hover:bg-gold-warm text-obsidian shadow-gold-champagne/5"
                          : "bg-white/5 text-muted-gray cursor-not-allowed border border-white/5"
                      }`}
                    >
                      <ShoppingCart size={13} />
                      {avail.available ? "Rent This Model" : "Unavailable"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-obsidian flex items-center justify-center text-xs font-mono text-muted-gray">COMPILING OPTICS MATRIX...</div>}>
      <ComparePageContent />
    </Suspense>
  );
}
