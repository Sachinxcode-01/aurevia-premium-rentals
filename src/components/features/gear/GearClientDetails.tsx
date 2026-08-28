"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/navigation/Navbar";
import { Product, ProductAddon } from "@/lib/db/mockData";
import { db, Review } from "@/lib/db/store";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import { Star, CheckCircle, Cpu, Heart, ShoppingCart, MessageCircle, Share2, ArrowRight } from "lucide-react";
import Link from "next/link";
import AvailabilityCalendar from "@/components/booking/AvailabilityCalendar";
import { getTomorrowDate, getDefaultReturnDate } from "@/lib/utils/dates";

interface GearClientDetailsProps {
  product: Product;
  slug: string;
}

export default function GearClientDetails({ product }: GearClientDetailsProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const toast = useToast();

  const [activeImage, setActiveImage] = useState(product.imagePrimary);
  const [relatedGear, setRelatedGear] = useState<Product[]>([]);
  const [isFavorite, setIsFavorite] = useState(() => {
    if (typeof window !== "undefined") {
      const favorites = JSON.parse(localStorage.getItem("favorites") || "[]") as string[];
      return favorites.includes(product.id);
    }
    return false;
  });

  // Reservation Form State with dynamic default dates
  const [startDate, setStartDate] = useState(getTomorrowDate(1));
  const [endDate, setEndDate] = useState(getDefaultReturnDate(3));
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  
  // Availability status
  const [fetchedAvailable, setFetchedAvailable] = useState(true);
  const [stockRemaining, setStockRemaining] = useState(product.inventoryQty || 1);
  const [checkingStock, setCheckingStock] = useState(false);

  // Reviews
  const [reviewsList, setReviewsList] = useState<Review[]>([]);

  // Derived state math
  const rentalDays = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return 0;
    }
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 || 1;
  }, [startDate, endDate]);

  const isAvailable = rentalDays > 0 && fetchedAvailable;

  const estimatedCost = useMemo(() => {
    if (rentalDays <= 0) return 0;
    const baseCost = product.dailyPrice * rentalDays * quantity;
    const addonsCost = selectedAddons.reduce((sum, addId) => {
      if (addId === "a1000000-0000-0000-0000-000000000001") return sum + 499 * rentalDays * quantity;
      if (addId === "a1000000-0000-0000-0000-000000000002") return sum + 199 * rentalDays * quantity;
      if (addId === "a1000000-0000-0000-0000-000000000003") return sum + 999 * rentalDays * quantity;
      return sum;
    }, 0);
    return baseCost + addonsCost;
  }, [rentalDays, quantity, selectedAddons, product]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const viewed = JSON.parse(localStorage.getItem("recently_viewed") || "[]") as string[];
      const updated = [product.id, ...viewed.filter((id) => id !== product.id)].slice(0, 5);
      localStorage.setItem("recently_viewed", JSON.stringify(updated));
    }

    db.getReviews(product.id, true).then(setReviewsList);
    db.getProducts().then((all) => {
      const filtered = all
        .filter((p) => p.id !== product.id && (p.categoryId === product.categoryId || p.brandId === product.brandId))
        .slice(0, 3);
      setRelatedGear(filtered.length > 0 ? filtered : all.filter((p) => p.id !== product.id).slice(0, 3));
    });
  }, [product]);

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} | AUREVIA Camera Rentals`,
          text: `Rent ${product.name} starting at ₹${product.dailyPrice}/day from AUREVIA.`,
          url: window.location.href,
        });
      } catch {
        // Ignored if cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Gear URL copied to clipboard!");
    }
  };

  useEffect(() => {
    if (rentalDays <= 0) return;

    let isMounted = true;
    queueMicrotask(async () => {
      if (!isMounted) return;
      setCheckingStock(true);
      const { available, remainingQty } = await db.checkAvailability(product.id, startDate, endDate);
      if (isMounted) {
        setFetchedAvailable(available);
        setStockRemaining(remainingQty);
        setCheckingStock(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [startDate, endDate, product, rentalDays]);

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]") as string[];
    let updated: string[];
    if (favorites.includes(product.id)) {
      updated = favorites.filter((id) => id !== product.id);
      setIsFavorite(false);
      toast.success("Removed from favorites");
    } else {
      updated = [...favorites, product.id];
      setIsFavorite(true);
      toast.success("Added to favorites!");
    }
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  const handleAddToCart = () => {
    if (!isAvailable) return;
    addToCart(product, quantity, startDate, endDate, selectedAddons);
    toast.success(`${product.name} added to cart!`);
  };

  const handleBookNow = () => {
    if (!isAvailable) return;
    addToCart(product, quantity, startDate, endDate, selectedAddons);
    router.push("/booking");
  };

  const generateWhatsAppUrl = () => {
    const message = `Hello AUREVIA, I would like to enquire about renting: ${product.name} from ${startDate} to ${endDate}.`;
    return `https://wa.me/919686909048?text=${encodeURIComponent(message)}`;
  };

  const addonsList: ProductAddon[] = [
    {
      id: "a1000000-0000-0000-0000-000000000001",
      name: "Sandisk Extreme PRO CFexpress 512GB",
      description: "High speed media for 8K video capture.",
      price: 499,
      isAvailable: true,
    },
    {
      id: "a1000000-0000-0000-0000-000000000002",
      name: "Extra LP-E6NH Battery",
      description: "Adds 2+ hours of continuous shoot time.",
      price: 199,
      isAvailable: true,
    },
  ];

  return (
    <main className="min-h-screen bg-obsidian text-ivory pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <Navbar />

      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-8 text-xs text-muted-gray uppercase tracking-widest flex items-center gap-2">
          <Link href="/" className="hover:text-gold-champagne transition-colors">Home</Link>
          <span>/</span>
          <Link href="/explore" className="hover:text-gold-champagne transition-colors">Explore</Link>
          <span>/</span>
          <span className="text-gold-champagne font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Gallery Section */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-charcoal border border-white/10 group">
              <Image
                src={activeImage}
                alt={product.name}
                fill
                priority
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                <button
                  onClick={handleShare}
                  aria-label="Share Gear"
                  className="p-3 rounded-full bg-obsidian/70 backdrop-blur-md border border-white/15 text-ivory hover:text-gold-champagne transition-colors cursor-pointer"
                  title="Share gear link"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={toggleFavorite}
                  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  className="p-3 rounded-full bg-obsidian/70 backdrop-blur-md border border-white/15 text-ivory hover:text-gold-champagne transition-colors cursor-pointer"
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? "fill-gold-champagne text-gold-champagne" : ""}`} />
                </button>
              </div>
            </div>

            {/* Thumbnail selector */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border ${
                      activeImage === img ? "border-gold-champagne" : "border-white/10 opacity-60"
                    }`}
                  >
                    <Image src={img} alt={`${product.name} angle ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Live Vault Availability Calendar */}
            <AvailabilityCalendar
              productName={product.name}
              onDateSelect={(start, end) => {
                setStartDate(start);
                setEndDate(end);
              }}
            />

            {/* Specifications Grid */}
            <div className="bg-charcoal/50 backdrop-blur-md border border-white/10 rounded-xl p-6 space-y-4">
              <h2 className="serif-heading text-lg text-ivory flex items-center gap-2">
                <Cpu className="w-5 h-5 text-gold-champagne" /> Technical Specifications
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                {product.specs &&
                  Object.entries(product.specs).map(([key, val]) => (
                    <div key={key} className="bg-obsidian/40 p-3 rounded-lg border border-white/5">
                      <div className="text-xs text-muted-gray uppercase tracking-wider">{key}</div>
                      <div className="font-semibold text-ivory mt-1">{val}</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-charcoal/50 border border-white/10 rounded-xl p-6 space-y-4">
              <h2 className="serif-heading text-lg text-ivory flex items-center gap-2">
                <Star className="w-5 h-5 text-gold-champagne fill-gold-champagne" /> Certified Creator Reviews
              </h2>
              {reviewsList.length === 0 ? (
                <p className="text-sm text-muted-gray">No reviews submitted yet for this unit.</p>
              ) : (
                <div className="space-y-4">
                  {reviewsList.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-lg bg-obsidian/40 border border-white/5 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-sm">{rev.authorName}</span>
                        <div className="flex text-gold-champagne">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-gold-champagne" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-gray italic">&ldquo;{rev.quote}&rdquo;</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Booking & Details Section */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-champagne/10 border border-gold-champagne/20 text-gold-champagne text-xs font-mono tracking-widest uppercase">
                <CheckCircle className="w-3.5 h-3.5" /> Certified Authentic
              </div>
              <h1 className="serif-heading text-3xl sm:text-4xl text-ivory tracking-tight">{product.name}</h1>
              <p className="text-sm text-muted-gray leading-relaxed">{product.description}</p>
            </div>

            {/* Rental Rates & Availability */}
            <div className="bg-charcoal/60 border border-white/10 rounded-xl p-6 space-y-6">
              <div className="flex items-baseline justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-3xl font-bold text-gold-champagne font-mono">₹{product.dailyPrice}</span>
                  <span className="text-xs text-muted-gray ml-2 uppercase tracking-wider">/ day</span>
                </div>
                <div className="text-xs text-right font-mono">
                  <span className="text-muted-gray">Total Units: </span>
                  <span className="text-ivory font-bold">{stockRemaining} available</span>
                </div>
              </div>

              {/* Rental Dates Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-muted-gray mb-1">Pickup Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-obsidian border border-white/15 rounded-lg px-3 py-2 text-xs text-ivory focus:border-gold-champagne outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-muted-gray mb-1">Return Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-obsidian border border-white/15 rounded-lg px-3 py-2 text-xs text-ivory focus:border-gold-champagne outline-none"
                    />
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-gray mb-1">Quantity</label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-obsidian border border-white/15 rounded-lg px-3 py-2 text-xs text-ivory focus:border-gold-champagne outline-none"
                  >
                    {[1, 2, 3].map((num) => (
                      <option key={num} value={num}>
                        {num} Unit{num > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Addons Selection */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs uppercase tracking-wider text-muted-gray">Recommended Add-ons</label>
                <div className="space-y-2">
                  {addonsList.map((addon) => (
                    <label
                      key={addon.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-obsidian/50 border border-white/10 hover:border-gold-champagne/40 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedAddons.includes(addon.id)}
                          onChange={() =>
                            setSelectedAddons((prev) =>
                              prev.includes(addon.id) ? prev.filter((id) => id !== addon.id) : [...prev, addon.id]
                            )
                          }
                          className="accent-gold-champagne rounded"
                        />
                        <div>
                          <div className="text-xs font-semibold text-ivory">{addon.name}</div>
                          <div className="text-[10px] text-muted-gray">{addon.description}</div>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-gold-champagne">+₹{addon.price}/day</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Calculation Summary */}
              <div className="bg-obsidian/70 p-4 rounded-lg border border-white/10 space-y-2">
                <div className="flex justify-between text-xs text-muted-gray">
                  <span>Rental Period:</span>
                  <span className="text-ivory font-mono">{rentalDays} Day(s)</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-ivory pt-2 border-t border-white/10">
                  <span>Estimated Total:</span>
                  <span className="text-gold-champagne font-mono">₹{estimatedCost.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-3">
                <button
                  onClick={handleBookNow}
                  disabled={!isAvailable || checkingStock}
                  className="w-full py-3.5 rounded-lg bg-gold-champagne text-obsidian font-semibold hover:bg-gold-champagne/90 transition-colors disabled:opacity-50 text-xs tracking-wider uppercase"
                >
                  Reserve Equipment Now
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={!isAvailable || checkingStock}
                  className="w-full py-3.5 rounded-lg bg-transparent border border-white/20 text-ivory font-semibold hover:bg-white/5 transition-colors disabled:opacity-50 text-xs tracking-wider uppercase flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4 text-gold-champagne" /> Add to Cart
                </button>
                <a
                  href={generateWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-semibold hover:bg-emerald-600/30 transition-colors text-xs tracking-wider uppercase flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" /> Enquire via Concierge WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Complementary Gear Recommendations */}
        {relatedGear.length > 0 && (
          <div className="mt-20 pt-12 border-t border-white/10 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-champagne font-mono block">
                  Curated Recommendations
                </span>
                <h2 className="serif-heading text-2xl sm:text-3xl text-ivory font-light">
                  Complementary <span className="text-gold">Cinema Gear</span>
                </h2>
              </div>
              <Link
                href="/explore"
                className="text-xs font-semibold uppercase tracking-wider text-gold-champagne hover:text-gold-warm flex items-center gap-1 transition-colors group"
              >
                View Full Vault <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedGear.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl bg-charcoal/40 border border-white/10 hover:border-gold-champagne/40 overflow-hidden flex flex-col justify-between transition-all duration-300 group shadow-xl"
                >
                  <div className="relative h-44 bg-black/40 overflow-hidden">
                    <Image
                      src={item.imagePrimary}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur text-[9px] font-mono text-gold-champagne border border-gold-border/20">
                      ₹{item.dailyPrice}/day
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <h3 className="serif-heading text-base text-ivory font-medium group-hover:text-gold transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-xs text-muted-gray line-clamp-2 font-light">{item.description}</p>
                    </div>
                    <Link
                      href={`/gear/${item.slug}`}
                      className="w-full py-2.5 rounded bg-white/5 hover:bg-gold-champagne hover:text-obsidian text-ivory text-xs font-semibold uppercase tracking-wider text-center transition-colors flex items-center justify-center gap-1.5 border border-white/10"
                    >
                      Inspect Model <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Booking Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-charcoal/95 backdrop-blur-xl border-t border-gold-champagne/20 p-4 z-40 flex items-center justify-between shadow-2xl">
        <div>
          <span className="text-[10px] text-muted-gray uppercase block font-mono">Total ({rentalDays} Days)</span>
          <span className="text-base font-bold text-gold-champagne font-mono">
            ₹{estimatedCost.toLocaleString("en-IN")}
          </span>
        </div>
        <button
          onClick={handleBookNow}
          disabled={!isAvailable || checkingStock}
          className="px-6 py-3 rounded-lg bg-gold-champagne text-obsidian font-bold text-xs uppercase tracking-wider shadow-lg hover:bg-gold-champagne/90 transition-colors disabled:opacity-50"
        >
          Book Now
        </button>
      </div>
    </main>
  );
}
