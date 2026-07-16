"use client";
import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navigation/Navbar";
import { db } from "@/lib/db/store";
import { Product, ProductAddon, MOCK_PRODUCTS } from "@/lib/db/mockData";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import {
  Calendar,
  ShieldAlert,
  ShoppingCart,
  MessageCircle,
  Star,
  CheckCircle,
  HelpCircle,
  Cpu,
  Bookmark,
  Sparkles,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { animate } from "animejs";

interface GearPageProps {
  params: Promise<{ slug: string }>;
}

export default function GearDetailsPage({ params }: GearPageProps) {
  const router = useRouter();
  const { slug } = use(params);

  const { addToCart, cart } = useCart();
  const toast = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  // Gallery Active Image
  const [activeImage, setActiveImage] = useState("");

  // Reservation Form State
  const [startDate, setStartDate] = useState("2026-07-20");
  const [endDate, setEndDate] = useState("2026-07-23");
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  
  // Availability status
  const [isAvailable, setIsAvailable] = useState(true);
  const [stockRemaining, setStockRemaining] = useState(1);
  const [checkingStock, setCheckingStock] = useState(false);

  // Booking Summary Math
  const [rentalDays, setRentalDays] = useState(3);
  const [estimatedCost, setEstimatedCost] = useState(0);

  // Smart Availability calendar state & suggestion
  const [bookedDates, setBookedDates] = useState<{ startDate: string; endDate: string }[]>([]);
  const [nearestRange, setNearestRange] = useState<{ startDate: string; endDate: string } | null>(null);

  // Waitlist form state
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [wlName, setWlName] = useState("");
  const [wlEmail, setWlEmail] = useState("");
  const [wlPhone, setWlPhone] = useState("");
  const [wlSubmitting, setWlSubmitting] = useState(false);
  const [wlSuccess, setWlSuccess] = useState(false);

  // Reviews submission state
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [revName, setRevName] = useState("");
  const [revRating, setRevRating] = useState(5);
  const [revQuote, setRevQuote] = useState("");
  const [revSubmitting, setRevSubmitting] = useState(false);
  const [revSuccess, setRevSuccess] = useState(false);

  // Load product details, booked dates, and reviews
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const item = await db.getProductBySlug(slug);
      if (item) {
        setProduct(item);
        setActiveImage(item.imagePrimary);
        
        // Track recently viewed in localStorage
        if (typeof window !== "undefined") {
          const viewed = JSON.parse(localStorage.getItem("recently_viewed") || "[]") as string[];
          const updated = [item.id, ...viewed.filter(id => id !== item.id)].slice(0, 5);
          localStorage.setItem("recently_viewed", JSON.stringify(updated));
        }

        // Fetch booked dates and reviews
        const dates = await db.getBookedDates(item.id);
        setBookedDates(dates);

        const revs = await db.getReviews(item.id, true);
        setReviewsList(revs);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [slug]);

  useEffect(() => {
    if (typeof window !== "undefined" && product) {
      const favorites = JSON.parse(localStorage.getItem("favorites") || "[]") as string[];
      setIsFavorite(favorites.includes(product.id));
    }
  }, [product]);

  const toggleFavorite = () => {
    if (!product) return;
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]") as string[];
    let updated: string[];
    if (favorites.includes(product.id)) {
      updated = favorites.filter(id => id !== product.id);
      setIsFavorite(false);
      toast.success("Removed from favorites");
    } else {
      updated = [...favorites, product.id];
      setIsFavorite(true);
      toast.success("Added to favorites!");
    }
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  // Recalculate days and check real database availability
  useEffect(() => {
    if (!product) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      setRentalDays(0);
      setIsAvailable(false);
      return;
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 || 1;
    setRentalDays(days);

    const verifyStock = async () => {
      setCheckingStock(true);
      const { available, remainingQty } = await db.checkAvailability(
        product.id,
        startDate,
        endDate
      );
      setIsAvailable(available);
      setStockRemaining(remainingQty);

      // Suggest nearest available dates if current dates are overlapping or not available
      if (!available) {
        let found = false;
        const checkDate = new Date();
        for (let i = 0; i < 90; i++) {
          const startStr = checkDate.toISOString().split("T")[0];
          const checkEndDate = new Date(checkDate.getTime() + (days - 1) * 86400000);
          const endStr = checkEndDate.toISOString().split("T")[0];

          const check = await db.checkAvailability(product.id, startStr, endStr);
          if (check.available) {
            setNearestRange({ startDate: startStr, endDate: endStr });
            found = true;
            break;
          }
          checkDate.setDate(checkDate.getDate() + 1);
        }
        if (!found) setNearestRange(null);
      } else {
        setNearestRange(null);
      }
      
      setCheckingStock(false);
    };

    verifyStock();
  }, [startDate, endDate, product]);

  // Recalculate total estimated price
  useEffect(() => {
    if (!product || rentalDays <= 0) return;

    let rate = product.dailyPrice;
    if (rentalDays >= 7) {
      // Use weekly price averaged per day
      rate = Math.min(rate, product.weeklyPrice / 7);
    }

    const baseCost = rate * rentalDays * quantity;
    
    // Addons cost accumulation
    const addonsCost = selectedAddons.reduce((sum, addId) => {
      if (addId === "a1000000-0000-0000-0000-000000000001") return sum + 499 * rentalDays * quantity;
      if (addId === "a1000000-0000-0000-0000-000000000002") return sum + 199 * rentalDays * quantity;
      if (addId === "a1000000-0000-0000-0000-000000000003") return sum + 999 * rentalDays * quantity;
      return sum;
    }, 0);

    setEstimatedCost(baseCost + addonsCost);
  }, [rentalDays, quantity, selectedAddons, product]);

  // Handle addon checkbox toggling
  const handleAddonToggle = (addonId: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId)
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId]
    );
  };

  const handleAddToCart = () => {
    if (!product || !isAvailable) return;
    addToCart(product, quantity, startDate, endDate, selectedAddons);
    // Success feedback animation
    animate(".add-cart-btn", {
      scale: [1, 0.95, 1],
      duration: 300,
      ease: "easeInOutQuad",
    });
  };

  const handleBookNow = () => {
    if (!product || !isAvailable) return;
    addToCart(product, quantity, startDate, endDate, selectedAddons);
    router.push("/booking");
  };

  // Generate pre-formatted WhatsApp Booking Inquiry
  const generateWhatsAppUrl = () => {
    if (!product) return "#";
    const refCode = `REF-${Math.floor(Math.random() * 90000) + 10000}`;
    
    // Detailed WhatsApp message structure
    const message = `Hello AUREVIA, I would like to enquire about renting the following gear:
    
- *Equipment:* ${product.name}
- *Quantity:* ${quantity} Unit(s)
- *Dates:* ${startDate} to ${endDate} (${rentalDays} Days)
- *Addons:* ${selectedAddons.length > 0 ? selectedAddons.map(id => id === "a1000000-0000-0000-0000-000000000001" ? "CFexpress 512GB" : id === "a1000000-0000-0000-0000-000000000002" ? "Extra Battery" : "Atomos Monitor").join(", ") : "None"}
- *Estimated Rental price:* INR ${estimatedCost.toLocaleString("en-IN")}
- *Concierge Reference:* ${refCode}

Please confirm availability and let me know the next steps. Thank you!`;

    const encoded = encodeURIComponent(message);
    return `https://wa.me/919686909048?text=${encoded}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center text-xs font-mono text-muted-gray">
        LOADING SPECIFICATIONS & IMAGES...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center gap-4 text-center">
        <h2 className="serif-heading text-2xl text-ivory">Equipment Not Found</h2>
        <Link href="/explore" className="text-gold-champagne hover:underline">
          Return to Showroom
        </Link>
      </div>
    );
  }

  const addonsList: ProductAddon[] = [
    {
      id: "a1000000-0000-0000-0000-000000000001",
      name: "Sandisk Extreme PRO CFexpress 512GB",
      description: "Required for high speed 8K RAW video recording.",
      price: 499,
      isAvailable: true,
    },
    {
      id: "a1000000-0000-0000-0000-000000000002",
      name: "Extra LP-E6NH Rechargeable Battery",
      description: "Adds 2+ hours of run-time on video shoots.",
      price: 199,
      isAvailable: true,
    },
    {
      id: "a1000000-0000-0000-0000-000000000003",
      name: "Atomos Ninja V 5\" 4K Monitor-Recorder",
      description: "External HDR monitor and ProRes recorder.",
      price: 999,
      isAvailable: true,
    },
  ];

  const relatedGear = MOCK_PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-obsidian text-ivory pb-32">
      <Navbar cartItemCount={cart.length} />

      {/* Breadcrumbs spacer */}
      <div className="pt-32 pb-4 px-6 md:px-12 max-w-7xl mx-auto text-xs font-mono text-muted-gray uppercase tracking-widest flex items-center gap-2">
        <Link href="/" className="hover:text-gold-champagne">Home</Link>
        <span>/</span>
        <Link href="/explore" className="hover:text-gold-champagne">Explore</Link>
        <span>/</span>
        <span className="text-gold-champagne">{product.name}</span>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Side: Product Gallery & Specs */}
        <div className="lg:col-span-7 space-y-12">
          
          {/* Gallery */}
          <div className="space-y-4">
            <div className="h-[450px] overflow-hidden rounded bg-black/45 flex items-center justify-center border border-white/5 relative">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-300"
              />
              <div className="absolute bottom-4 left-4 bg-obsidian/80 backdrop-blur px-3 py-1.5 rounded border border-white/10 text-[10px] font-mono tracking-widest text-gold-champagne uppercase">
                Studio View
              </div>
            </div>

            {/* Gallery Thumbnails */}
            <div className="flex gap-4">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-24 h-16 rounded overflow-hidden border bg-black/25 flex items-center justify-center transition cursor-pointer ${
                    activeImage === img ? "border-gold-champagne" : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          </div>

          {/* Description & specs */}
          <div className="space-y-6">
            <h2 className="serif-heading text-2xl font-light text-ivory border-b border-white/5 pb-3">
              Product Overview
            </h2>
            <p className="text-sm text-muted-gray leading-relaxed font-light">
              {product.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6">
              {Object.entries(product.specs).map(([key, val]) => (
                <div key={key} className="glass-panel p-4 rounded border-white/5">
                  <span className="text-[9px] uppercase tracking-wider text-gold-champagne font-mono block mb-1">
                    {key.replace("_", " ")}
                  </span>
                  <span className="text-sm font-light text-ivory">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trusted Rental Safeguards Section */}
          <div className="glass-panel border-white/5 rounded-lg p-6 space-y-6">
            <h3 className="serif-heading text-lg font-light text-ivory border-b border-white/5 pb-3">AUREVIA Trust Protocols</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-light">
              <div className="flex gap-3">
                <span className="text-gold-champagne font-bold text-sm shrink-0">✓</span>
                <div>
                  <h4 className="font-semibold text-ivory">Pre-Rental Inspection</h4>
                  <p className="text-[10px] text-muted-gray mt-0.5">Sensors are professionally swabbed and lenses checked on collimators before every pickup.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-gold-champagne font-bold text-sm shrink-0">✓</span>
                <div>
                  <h4 className="font-semibold text-ivory">Zero Hidden Fees</h4>
                  <p className="text-[10px] text-muted-gray mt-0.5">The price you see is final. No security deposits, GST add-ons, or surprise handling fees.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-gold-champagne font-bold text-sm shrink-0">✓</span>
                <div>
                  <h4 className="font-semibold text-ivory">Direct Concierge Support</h4>
                  <p className="text-[10px] text-muted-gray mt-0.5">Direct chat access to Prem for troubleshooting or accessories adjustment.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-gold-champagne font-bold text-sm shrink-0">✓</span>
                <div>
                  <h4 className="font-semibold text-ivory">Transparent Damage Policy</h4>
                  <p className="text-[10px] text-muted-gray mt-0.5">Accidents happen. We evaluate repairs fairly using manufacturer quotes. No arbitrary penalties.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Verified Customer Feedback */}
          <div className="space-y-6 pt-6">
            <h3 className="serif-heading text-xl font-light text-ivory border-b border-white/5 pb-3">Customer Experiences</h3>
            
            {reviewsList.length === 0 ? (
              <p className="text-xs text-muted-gray italic">No verified reviews submitted yet for this model. Be the first to share your experience!</p>
            ) : (
              <div className="space-y-4">
                {reviewsList.map((rev) => (
                  <div key={rev.id} className="glass-panel border-white/5 rounded p-4 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-ivory">{rev.authorName}</span>
                      <span className="text-gold-champagne">{"★".repeat(rev.rating)}</span>
                    </div>
                    <p className="text-xs text-muted-gray font-light italic">"{rev.quote}"</p>
                  </div>
                ))}
              </div>
            )}

            {/* Leave a Review Form */}
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!revName || !revQuote) return;
              setRevSubmitting(true);
              await db.submitReview({
                productId: product.id,
                authorName: revName,
                rating: revRating,
                quote: revQuote
              });
              setRevSubmitting(false);
              setRevSuccess(true);
              setRevName("");
              setRevQuote("");
            }} className="glass-panel border-white/5 rounded p-5 space-y-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gold-champagne font-mono block">Share Your Experience</span>
              {revSuccess ? (
                <div className="text-xs text-emerald-400 font-mono bg-emerald-500/10 p-3 border border-emerald-500/20 rounded">
                  Thank you! Your feedback has been submitted for admin approval.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] text-muted-gray uppercase font-mono">Your Name</label>
                      <input
                        type="text"
                        required
                        value={revName}
                        onChange={(e) => setRevName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-xs rounded p-2 focus:outline-none focus:border-gold-champagne/40"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-muted-gray uppercase font-mono">Rating</label>
                      <select
                        value={revRating}
                        onChange={(e) => setRevRating(Number(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 text-xs rounded p-2 focus:outline-none focus:border-gold-champagne/40 text-ivory"
                      >
                        {[5, 4, 3, 2, 1].map(r => (
                          <option key={r} value={r} className="bg-obsidian text-ivory">{r} Stars</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-muted-gray uppercase font-mono">Review Comments</label>
                    <textarea
                      required
                      rows={3}
                      value={revQuote}
                      onChange={(e) => setRevQuote(e.target.value)}
                      placeholder="Share your shooting experience with this camera..."
                      className="w-full bg-white/5 border border-white/10 text-xs rounded p-2 focus:outline-none focus:border-gold-champagne/40 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={revSubmitting}
                    className="px-4 py-2 bg-gold-champagne hover:bg-gold-warm text-obsidian text-[10px] font-bold uppercase tracking-wider rounded transition cursor-pointer disabled:opacity-50"
                  >
                    {revSubmitting ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Related Gear */}
          <div className="space-y-6 pt-6">
            <h3 className="serif-heading text-xl font-light text-ivory border-b border-white/5 pb-3">
              Similar Equipment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedGear.map((g) => (
                <Link
                  key={g.id}
                  href={`/gear/${g.slug}`}
                  className="glass-panel hover:border-gold-border rounded p-4 block space-y-3 group transition"
                >
                  <div className="h-24 overflow-hidden rounded bg-black/20 flex items-center justify-center">
                    <img src={g.imagePrimary} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="" />
                  </div>
                  <div>
                    <h4 className="serif-heading text-sm text-ivory truncate group-hover:text-gold-champagne transition">{g.name}</h4>
                    <p className="text-[10px] text-gold-champagne mt-1">₹{g.dailyPrice.toLocaleString("en-IN")}/day</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
        {/* Right Side: Sticky Checkout / Booking Panel */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 glass-panel-gold rounded-lg p-6 md:p-8 border-gold-border space-y-6 shadow-2xl backdrop-blur-md">
            
            <div className="border-b border-white/10 pb-4 flex justify-between items-start gap-4">
              <div>
                <span className="text-[10px] uppercase text-gold-champagne tracking-widest block font-mono mb-1">
                  Luxury Optics Concierge
                </span>
                <h1 className="serif-heading text-3xl font-light text-ivory">{product.name}</h1>
              </div>
              <button
                onClick={toggleFavorite}
                className="p-2.5 rounded-full border border-white/10 bg-white/5 hover:border-gold-border hover:bg-gold-champagne/10 text-gold-champagne transition duration-350 cursor-pointer"
                title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              >
                <Heart size={18} fill={isFavorite ? "#D8B36A" : "transparent"} />
              </button>
            </div>

            {/* Rates Table */}
            <div className="grid grid-cols-2 gap-4 bg-white/5 rounded p-4 border border-white/5 text-center">
              <div>
                <span className="text-[8px] text-muted-gray uppercase block font-mono">Daily Rate</span>
                <span className="text-lg font-bold text-gold-champagne">₹{product.dailyPrice.toLocaleString("en-IN")}</span>
              </div>
              <div className="border-l border-white/10">
                <span className="text-[8px] text-muted-gray uppercase block font-mono">Weekly Rate</span>
                <span className="text-lg font-bold text-ivory/80">₹{product.weeklyPrice.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Date Pickers */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">Select Booking Schedule</label>
                {product.inventoryQty === 1 && (
                  <span className="text-[8px] text-amber-400 font-mono uppercase bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                    Only 1 Model Available
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[8px] text-muted-gray uppercase block mb-1">Pickup Date</span>
                  <div className="relative">
                    <input
                      type="date"
                      value={startDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-xs rounded p-2.5 focus:outline-none focus:border-gold-champagne/40"
                    />
                  </div>
                </div>

                <div>
                  <span className="text-[8px] text-muted-gray uppercase block mb-1">Return Date</span>
                  <div className="relative">
                    <input
                      type="date"
                      value={endDate}
                      min={startDate || new Date().toISOString().split("T")[0]}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-xs rounded p-2.5 focus:outline-none focus:border-gold-champagne/40"
                    />
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <div className="flex justify-between items-center bg-white/5 rounded p-2 px-4 border border-white/5">
                <span className="text-[10px] text-muted-gray uppercase font-mono">Quantity</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-sm font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(prev => Math.min(product.inventoryQty, prev + 1))}
                    className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Smart Availability Suggestions */}
            {nearestRange && (
              <div className="bg-gold-champagne/5 border border-gold-border/30 rounded p-4 space-y-2">
                <span className="text-[9px] text-gold-champagne uppercase font-mono block">Overlap Detected</span>
                <p className="text-[10px] text-muted-gray">This camera is booked for selected dates. Try the nearest available window:</p>
                <div className="flex items-center justify-between gap-3 pt-1">
                  <span className="text-[10px] font-mono text-ivory">{nearestRange.startDate} to {nearestRange.endDate}</span>
                  <button
                    onClick={() => {
                      setStartDate(nearestRange.startDate);
                      setEndDate(nearestRange.endDate);
                    }}
                    className="px-2.5 py-1 bg-gold-champagne text-obsidian text-[9px] font-bold uppercase rounded hover:bg-gold-warm transition cursor-pointer"
                  >
                    Select Window
                  </button>
                </div>
              </div>
            )}

            {/* Addons Selection */}
            <div className="space-y-3 pt-3 border-t border-white/5">
              <span className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">Recommended Accessories</span>
              
              <div className="space-y-2">
                {addonsList.map((addon) => (
                  <label
                    key={addon.id}
                    className={`flex items-start gap-3 p-3 rounded border transition cursor-pointer ${
                      selectedAddons.includes(addon.id)
                        ? "bg-gold-champagne/5 border-gold-champagne/40"
                        : "bg-white/5 border-white/5 hover:border-white/15"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAddons.includes(addon.id)}
                      onChange={() => handleAddonToggle(addon.id)}
                      className="mt-0.5 rounded border-white/20 accent-gold-champagne cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>{addon.name}</span>
                        <span className="text-gold-champagne">₹0/day <span className="text-[8px] text-muted-gray line-through">₹{addon.price}</span></span>
                      </div>
                      <p className="text-[10px] text-muted-gray mt-0.5 font-light">{addon.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Availability Indicator & Waitlist System */}
            <div className="border-t border-white/5 pt-4">
              {checkingStock ? (
                <div className="text-[11px] font-mono text-muted-gray animate-pulse uppercase">
                  Checking inventory vault availability...
                </div>
              ) : isAvailable ? (
                <div className="flex items-center justify-between text-xs text-emerald-400 font-mono uppercase bg-emerald-400/5 border border-emerald-400/20 p-3 rounded">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle size={14} />
                    <span>Gear Available</span>
                  </div>
                  <span>{stockRemaining} in Gadag</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-rose-400 font-mono uppercase bg-rose-400/5 border border-rose-400/20 p-3 rounded">
                    <ShieldAlert size={14} />
                    Fully Booked For Chosen Dates
                  </div>
                  
                  {/* Waitlist Box */}
                  <div className="glass-panel border-white/5 rounded p-4 space-y-3">
                    <span className="text-[10px] uppercase font-semibold text-gold-champagne font-mono block">Join Availability Waitlist</span>
                    {wlSuccess ? (
                      <p className="text-[10px] text-emerald-400 font-mono">You're on the waitlist! We will alert you immediately if dates open.</p>
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="text"
                          required
                          placeholder="Your Name"
                          value={wlName}
                          onChange={(e) => setWlName(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 text-xs rounded p-2 focus:outline-none focus:border-gold-champagne/40"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="email"
                            required
                            placeholder="Email Address"
                            value={wlEmail}
                            onChange={(e) => setWlEmail(e.target.value)}
                            className="bg-white/5 border border-white/10 text-xs rounded p-2 focus:outline-none focus:border-gold-champagne/40"
                          />
                          <input
                            type="tel"
                            required
                            placeholder="Phone Number"
                            value={wlPhone}
                            onChange={(e) => setWlPhone(e.target.value)}
                            className="bg-white/5 border border-white/10 text-xs rounded p-2 focus:outline-none focus:border-gold-champagne/40"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!wlName || !wlEmail || !wlPhone) return;
                            setWlSubmitting(true);
                            await db.addToWaitlist({
                              productId: product.id,
                              name: wlName,
                              email: wlEmail,
                              phone: wlPhone,
                              startDate,
                              endDate
                            });
                            setWlSubmitting(false);
                            setWlSuccess(true);
                          }}
                          disabled={wlSubmitting}
                          className="w-full py-2 bg-white/10 hover:bg-white/15 text-gold-champagne text-[10px] font-bold uppercase rounded transition cursor-pointer"
                        >
                          {wlSubmitting ? "Joining..." : "Join Waitlist"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Calculations and CTA Booking */}
            {rentalDays > 0 && isAvailable && (
              <div className="space-y-4 bg-black/45 rounded-lg p-5 border border-white/5">
                <div className="flex justify-between text-xs text-muted-gray">
                  <span>Duration:</span>
                  <span className="font-mono text-ivory">{rentalDays} Days</span>
                </div>

                <div className="flex justify-between text-xs font-semibold border-t border-white/5 pt-2">
                  <span>Est. Rent Cost:</span>
                  <span className="font-mono text-gold-champagne">₹{estimatedCost.toLocaleString("en-IN")}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {/* Whatsapp Inquiry CTA */}
                  <a
                    href={generateWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider rounded flex items-center justify-center gap-1.5 transition cursor-pointer shadow-lg shadow-emerald-600/10"
                  >
                    <MessageCircle size={13} />
                    WhatsApp Booking
                  </a>
                  
                  {/* Cart checkout */}
                  <button
                    onClick={handleBookNow}
                    className="py-3 bg-gold-champagne hover:bg-gold-warm text-obsidian text-[10px] font-bold uppercase tracking-wider rounded transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-gold-champagne/10"
                  >
                    <ShoppingCart size={13} />
                    Book Online
                  </button>
                </div>
                
                <button
                  onClick={handleAddToCart}
                  className="add-cart-btn w-full py-2.5 bg-transparent border border-white/20 hover:border-gold-champagne text-ivory hover:text-gold-champagne text-[9px] font-semibold uppercase tracking-wider rounded transition cursor-pointer flex items-center justify-center gap-1"
                >
                  Add to Rental Cart
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
