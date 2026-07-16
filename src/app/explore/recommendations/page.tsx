"use client";

import React, { useState } from "react";
import { db } from "@/lib/db/store";
import { MOCK_PRODUCTS, Product } from "@/lib/db/mockData";
import { useToast } from "@/hooks/useToast";
import { useCart } from "@/hooks/useCart";
import { 
  Camera, ChevronRight, ChevronLeft, Check, AlertCircle, 
  HelpCircle, Sparkles, BookOpen, Clock, Calendar
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Purpose = "portraits" | "events" | "wildlife" | "cinema" | "casual";
type Experience = "beginner" | "pro";

export default function CameraRecommendations() {
  const toast = useToast();
  const router = useRouter();
  const { addToCart } = useCart();

  // Wizard state
  const [step, setStep] = useState(1);
  const [purpose, setPurpose] = useState<Purpose | "">("");
  const [experience, setExperience] = useState<Experience | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<{
    product: Product;
    reason: string;
    available: boolean;
    remaining: number;
    alternatives?: { product: Product; reason: string; available: boolean }[];
  } | null>(null);

  // Constants
  const CANON_ID = "p1000000-0000-0000-0000-000000000001";
  const NIKON_ID = "p1000000-0000-0000-0000-000000000003";

  const handleNext = () => {
    if (step === 1 && !purpose) {
      toast.error("Please select a shooting purpose.");
      return;
    }
    if (step === 2 && !experience) {
      toast.error("Please select your experience level.");
      return;
    }
    if (step === 3) {
      if (!startDate || !endDate) {
        toast.error("Please select your rental dates.");
        return;
      }
      if (startDate > endDate) {
        toast.error("Start date cannot be after end date.");
        return;
      }
      generateRecommendation();
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const generateRecommendation = async () => {
    setLoading(true);
    try {
      // 1. Fetch real-time availability for both cameras
      const [canonAvail, nikonAvail] = await Promise.all([
        db.checkAvailability(CANON_ID, startDate, endDate),
        db.checkAvailability(NIKON_ID, startDate, endDate)
      ]);

      const canonProduct = MOCK_PRODUCTS.find(p => p.id === CANON_ID)!;
      const nikonProduct = MOCK_PRODUCTS.find(p => p.id === NIKON_ID)!;

      // 2. Matching logic
      let recommendedId = CANON_ID;
      let reason = "";

      if (!canonAvail.available && !nikonAvail.available) {
        // Both booked out
        recommendedId = purpose === "wildlife" || purpose === "cinema" ? NIKON_ID : CANON_ID;
        reason = `Based on your choice of ${purpose} and ${experience} level, the ${recommendedId === CANON_ID ? "Canon EOS R5" : "Nikon Z8"} is your perfect match. However, both cameras are currently fully booked for these dates. We recommend joining the waitlist.`;
        
        setRecommendation({
          product: recommendedId === CANON_ID ? canonProduct : nikonProduct,
          reason,
          available: false,
          remaining: 0
        });
        setStep(4);
        return;
      }

      if (canonAvail.available && !nikonAvail.available) {
        // Only Canon is available
        setRecommendation({
          product: canonProduct,
          reason: `We highly recommend the Canon EOS R5. It is fully available for your selected dates. The Nikon Z8 is currently booked. The Canon's 45MP sensor and class-leading autofocus are excellent for your ${purpose} project.`,
          available: true,
          remaining: canonAvail.remainingQty
        });
        setStep(4);
        return;
      }

      if (!canonAvail.available && nikonAvail.available) {
        // Only Nikon is available
        setRecommendation({
          product: nikonProduct,
          reason: `We highly recommend the Nikon Z8. It is fully available for your selected dates. The Canon EOS R5 is currently booked. The Nikon's high-speed stacked sensor and professional subject tracking are perfect for your ${purpose} project.`,
          available: true,
          remaining: nikonAvail.remainingQty
        });
        setStep(4);
        return;
      }

      // Both are available, decide based on questionnaire
      if (purpose === "wildlife" || purpose === "cinema") {
        recommendedId = NIKON_ID;
        reason = `For wildlife, action, or cinematic video production, the Nikon Z8 is unparalleled. Its blackout-free stacked sensor, 8K 60p N-RAW internal recording, and deep learning subject autofocus tracking make it the industry choice.`;
      } else if (purpose === "portraits" || purpose === "events") {
        recommendedId = CANON_ID;
        reason = `For high-end portrait sessions, wedding shoots, or events, the Canon EOS R5 is the ultimate choice. The 45MP resolution captures exquisite details, and Canon's legendary skin tone rendition and autofocus will guarantee flawless results.`;
      } else {
        // Casual / travel
        if (experience === "beginner") {
          recommendedId = CANON_ID;
          reason = `The Canon EOS R5 is highly recommended for travel and casual shoots. Its touch menu navigation, lighter body profile, and highly intuitive tracking make it easy to frame the extraordinary without complex menu setups.`;
        } else {
          recommendedId = NIKON_ID;
          reason = `The Nikon Z8 is recommended for travel photography. The robust physical buttons and stacked sensor speeds allow professional-level action captures on the go.`;
        }
      }

      setRecommendation({
        product: recommendedId === CANON_ID ? canonProduct : dbProductMap(nikonProduct),
        reason,
        available: true,
        remaining: recommendedId === CANON_ID ? canonAvail.remainingQty : nikonAvail.remainingQty,
        alternatives: [
          {
            product: recommendedId === CANON_ID ? nikonProduct : canonProduct,
            available: true,
            reason: recommendedId === CANON_ID 
              ? "The Nikon Z8 is also available and is outstanding for high-speed action and internal RAW recording."
              : "The Canon EOS R5 is also available and is excellent for high-resolution stills and rich skin tones."
          }
        ]
      });
      setStep(4);
    } catch (err: any) {
      toast.error("Failed to generate recommendations: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const dbProductMap = (p: any): Product => {
    return {
      id: p.id,
      brandId: p.brandId,
      categoryId: p.categoryId,
      name: p.name,
      slug: p.slug,
      description: p.description,
      dailyPrice: p.dailyPrice || 799,
      weeklyPrice: p.weeklyPrice || 4999,
      inventoryQty: p.inventoryQty || 1,
      rating: p.rating || 5,
      isFeatured: p.isFeatured || false,
      isArchived: p.isArchived || false,
      specs: p.specs || {},
      imagePrimary: p.imagePrimary || "/assets/canon-sequence/frame-210.jpg",
      images: p.images || []
    };
  };

  const handleBookNow = (product: Product) => {
    addToCart(product, 1, startDate, endDate, []);
    toast.success(`${product.name} added to cart! Proceeding to booking.`);
    router.push("/booking");
  };

  return (
    <div className="flex-1 flex flex-col bg-obsidian py-12 px-4 relative">
      <div className="film-grain opacity-10" />
      
      <div className="max-w-xl mx-auto w-full flex-1 flex flex-col justify-center">
        {/* Progress bar */}
        {step < 4 && (
          <div className="flex gap-2 mb-8 justify-center">
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`h-1 w-12 rounded transition-all duration-350 ${step >= s ? "bg-gold-champagne" : "bg-white/10"}`}
              />
            ))}
          </div>
        )}

        <div className="glass-panel border-white/5 p-6 md:p-8 rounded-lg shadow-2xl bg-charcoal/40 backdrop-blur-md">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <Sparkles className="text-gold-champagne h-6 w-6 mx-auto mb-2.5" />
                <h2 className="font-serif text-lg md:text-xl font-bold tracking-wide text-ivory">
                  What is your project's primary purpose?
                </h2>
                <p className="text-[11px] text-muted-gray mt-1">
                  We'll suggest the optimal camera body and lens combinations.
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                {[
                  { id: "portraits", label: "Portraits & Fashion shoots", desc: "Studio styling, high resolution, precise skin tones" },
                  { id: "events", label: "Weddings & Events", desc: "Low light performance, long battery life, fast autofocus" },
                  { id: "wildlife", label: "Wildlife & Action", desc: "High frame rate burst shooting, advanced subject tracking" },
                  { id: "cinema", label: "Cinema & Video Production", desc: "RAW formats, internal recording, professional video profiles" },
                  { id: "casual", label: "Casual / Travel Vlogging", desc: "Lighter setups, ease of use, versatile focal lengths" }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setPurpose(item.id as Purpose)}
                    className={`text-left p-3.5 rounded border transition cursor-pointer flex flex-col gap-0.5 ${purpose === item.id ? "bg-gold-champagne/10 border-gold-champagne text-gold-champagne" : "bg-black/30 border-white/5 hover:border-white/10 text-ivory/80"}`}
                  >
                    <span className="text-xs font-semibold">{item.label}</span>
                    <span className="text-[10px] text-muted-gray">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <BookOpen className="text-gold-champagne h-6 w-6 mx-auto mb-2.5" />
                <h2 className="font-serif text-lg md:text-xl font-bold tracking-wide text-ivory">
                  What is your experience level?
                </h2>
                <p className="text-[11px] text-muted-gray mt-1">
                  Helps us choose menus and features that fit your flow.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  { id: "beginner", label: "Beginner / Amateur", desc: "I want plug-and-play operation, intelligent auto modes, and simple menus." },
                  { id: "pro", label: "Professional / Advanced", desc: "I need full manual controls, RAW capture files, custom settings, and advanced outputs." }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setExperience(item.id as Experience)}
                    className={`text-left p-4 rounded border transition cursor-pointer flex flex-col gap-1 ${experience === item.id ? "bg-gold-champagne/10 border-gold-champagne text-gold-champagne" : "bg-black/30 border-white/5 hover:border-white/10 text-ivory/80"}`}
                  >
                    <span className="text-xs font-semibold">{item.label}</span>
                    <span className="text-[10px] text-muted-gray leading-relaxed">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <Calendar className="text-gold-champagne h-6 w-6 mx-auto mb-2.5" />
                <h2 className="font-serif text-lg md:text-xl font-bold tracking-wide text-ivory">
                  Select your rental dates
                </h2>
                <p className="text-[11px] text-muted-gray mt-1">
                  We verify real-time inventory availability in Gadag.
                </p>
              </div>

              <div className="flex flex-col gap-4 bg-black/40 border border-white/5 p-4 rounded">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono uppercase text-muted-gray">Pickup Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-charcoal border border-white/10 rounded p-2.5 text-xs text-ivory focus:outline-none focus:border-gold-champagne"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono uppercase text-muted-gray">Return Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    min={startDate || new Date().toISOString().split("T")[0]}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-charcoal border border-white/10 rounded p-2.5 text-xs text-ivory focus:outline-none focus:border-gold-champagne"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && recommendation && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center gap-1 bg-gold-champagne/10 border border-gold-champagne/20 rounded-full px-3 py-1 mb-2.5">
                  <Sparkles size={11} className="text-gold-champagne" />
                  <span className="text-[9px] font-mono uppercase font-bold tracking-wider text-gold-champagne">
                    AI Match Confirmed
                  </span>
                </div>
                <h2 className="font-serif text-lg md:text-xl font-bold tracking-wide text-ivory">
                  Your Smart Recommendation
                </h2>
              </div>

              {/* Recommendation card */}
              <div className="bg-black/55 border border-gold-champagne/20 rounded-lg p-5 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-serif font-bold text-gold-champagne">
                      {recommendation.product.name}
                    </h3>
                    <p className="text-[10px] text-muted-gray mt-0.5 uppercase tracking-widest font-mono">
                      ₹{recommendation.product.dailyPrice} per day
                    </p>
                  </div>
                  {recommendation.available ? (
                    <span className="text-[9px] font-mono uppercase font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded">
                      Available
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono uppercase font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400 px-2 py-0.5 rounded">
                      Fully Booked
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-ivory/80 leading-relaxed font-sans">
                  {recommendation.reason}
                </p>

                {/* Specs list */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-white/5 p-3 rounded">
                  {Object.entries(recommendation.product.specs || {}).slice(0, 4).map(([k, v]: any) => (
                    <div key={k}>
                      <span className="text-muted-gray block uppercase text-[8px]">{k}</span>
                      <span className="text-ivory font-bold">{v}</span>
                    </div>
                  ))}
                </div>

                {recommendation.available ? (
                  <button
                    onClick={() => handleBookNow(recommendation.product)}
                    className="w-full py-3 bg-gold-champagne text-obsidian text-[10px] font-extrabold uppercase tracking-widest rounded hover:bg-gold-champagne/90 transition font-mono cursor-pointer"
                  >
                    Reserve Now (₹{recommendation.product.dailyPrice}/day)
                  </button>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    <p className="text-[10px] text-rose-300 font-mono">
                      No stock remains for your dates. You can join the waiting list to be notified instantly.
                    </p>
                    <Link
                      href={`/gear/${recommendation.product.slug}`}
                      className="w-full py-3 border border-gold-champagne/30 text-center text-gold-champagne text-[10px] font-bold uppercase tracking-widest rounded hover:bg-gold-champagne/10 transition font-mono"
                    >
                      Join Availability Waitlist
                    </Link>
                  </div>
                )}
              </div>

              {/* Alternatives */}
              {recommendation.alternatives && recommendation.alternatives.length > 0 && (
                <div className="border-t border-white/5 pt-4">
                  <h4 className="text-[10px] uppercase font-mono tracking-wider text-muted-gray mb-2.5">
                    Alternative Available Option
                  </h4>
                  {recommendation.alternatives.map((alt, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 rounded p-3 flex justify-between items-center gap-3">
                      <div className="flex-1">
                        <h5 className="text-[11px] font-semibold text-ivory">{alt.product.name}</h5>
                        <p className="text-[10px] text-muted-gray mt-0.5 leading-snug">{alt.reason}</p>
                      </div>
                      <button
                        onClick={() => handleBookNow(alt.product)}
                        className="shrink-0 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-[10px] font-bold uppercase text-gold-champagne rounded transition cursor-pointer"
                      >
                        Book
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Navigation Controls */}
          {step < 4 && (
            <div className="border-t border-white/5 pt-4 mt-6 flex justify-between items-center">
              {step > 1 ? (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1 text-ivory/60 hover:text-ivory text-[10px] font-bold uppercase font-mono cursor-pointer"
                >
                  <ChevronLeft size={14} /> Back
                </button>
              ) : (
                <div />
              )}
              
              <button
                onClick={handleNext}
                disabled={loading}
                className="flex items-center gap-1 bg-gold-champagne text-obsidian px-5 py-2.5 rounded text-[10px] font-extrabold uppercase font-mono hover:bg-gold-champagne/90 transition cursor-pointer disabled:opacity-50"
              >
                {loading ? "Matching..." : step === 3 ? "Get Match" : "Next"} <ChevronRight size={14} />
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="border-t border-white/5 pt-4 mt-6 text-center">
              <button
                onClick={() => {
                  setStep(1);
                  setPurpose("");
                  setExperience("");
                  setStartDate("");
                  setEndDate("");
                  setRecommendation(null);
                }}
                className="text-[10px] font-bold font-mono text-gold-champagne/80 hover:text-gold-champagne uppercase tracking-wider cursor-pointer"
              >
                Restart Questionnaire
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
