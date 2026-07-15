"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/navigation/Navbar";
import { db } from "@/lib/db/store";
import { Product } from "@/lib/db/mockData";
import { ArrowLeft, Check, ShoppingCart, RefreshCw, X } from "lucide-react";
import { useCart } from "@/hooks/useCart";

function ComparePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const idsParam = searchParams.get("ids") || "";

  const { addToCart, cart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompared = async () => {
      setLoading(true);
      if (idsParam) {
        const idList = idsParam.split(",");
        const fetched: Product[] = [];
        for (const id of idList) {
          const prod = await db.getProductById(id);
          if (prod) fetched.push(prod);
        }
        setProducts(fetched);
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

  // Compile a unique list of specification keys across compared products
  const specKeys = Array.from(
    new Set(products.flatMap((p) => Object.keys(p.specs)))
  );

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
              <div className="py-2.5">Weekly Rental Price</div>
              <div className="py-2.5 border-b border-white/5 pb-4">Refundable Security Deposit</div>
              
              {specKeys.map((key) => (
                <div key={key} className="py-2.5 border-b border-white/5 truncate">
                  {key.replace("_", " ")}
                </div>
              ))}
            </div>

            {/* Compared Product Columns */}
            {products.map((product) => (
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
                      <span className="md:hidden text-[8px] text-muted-gray uppercase block font-mono">Weekly Price</span>
                      <span className="text-xs text-ivory/80">₹{product.weeklyPrice.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="py-1 border-b border-white/5 pb-4">
                      <span className="md:hidden text-[8px] text-muted-gray uppercase block font-mono">Security Deposit</span>
                      <span className="text-xs text-muted-gray">₹{product.securityDeposit.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  {/* Specs List */}
                  <div className="space-y-4 font-sans text-xs">
                    {specKeys.map((key) => {
                      const value = product.specs[key] || "—";
                      return (
                        <div key={key} className="py-1 border-b border-white/5 flex flex-col md:block">
                          <span className="md:hidden text-[8px] text-muted-gray uppercase font-mono block mb-0.5">{key.replace("_", " ")}</span>
                          <span className="text-ivory font-light truncate block">{value}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Direct CTA */}
                <div className="pt-8">
                  <button
                    onClick={() => handleBook(product)}
                    className="w-full py-3 bg-gold-champagne hover:bg-gold-warm text-obsidian text-xs font-bold uppercase tracking-wider rounded transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-gold-champagne/5"
                  >
                    <ShoppingCart size={13} />
                    Rent This Model
                  </button>
                </div>
              </div>
            ))}
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
