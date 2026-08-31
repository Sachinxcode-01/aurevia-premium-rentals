"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Camera,
  Layers,
  Zap,
  FileText,
  Package,
  Sparkles,
  ArrowRight,
  X,
  Compass,
  HelpCircle,
  Shield,
  Sliders,
} from "lucide-react";

interface SearchItem {
  id: string;
  title: string;
  category: "Cameras" | "Lenses & Optics" | "Packages" | "Cine Tools" | "Navigation";
  description: string;
  href: string;
  icon: any;
  badge?: string;
}

const SEARCH_ITEMS: SearchItem[] = [
  // CINE TOOLS
  {
    id: "tool-lens-match",
    title: "Lens & Sensor Coverage Lab",
    category: "Cine Tools",
    description: "Interactive sensor crops (FF/S35/VV), 1.33x–2.0x anamorphic desqueeze, and DoF calculator.",
    href: "/tools/lens-match",
    icon: Sliders,
    badge: "New Tool",
  },
  {
    id: "tool-power-media",
    title: "Power & Media Runtime Calculator",
    category: "Cine Tools",
    description: "Calculate V-Mount battery runtimes, ARRIRAW / REDCODE bitrates, and card counts.",
    href: "/tools/power-media-calculator",
    icon: Zap,
    badge: "New Tool",
  },
  {
    id: "tool-callsheet",
    title: "Equipment Manifest & Call Sheet Generator",
    category: "Cine Tools",
    description: "Export printable camera department manifests with serials, Pelican cases, and 1st AC sign-offs.",
    href: "/tools/callsheet-manifest",
    icon: FileText,
    badge: "PDF Export",
  },
  {
    id: "tool-sensor-sim",
    title: "Sensor Crop Simulator",
    category: "Cine Tools",
    description: "Visual camera sensor comparison and focal length pre-visualization.",
    href: "/tools/sensor-simulator",
    icon: Layers,
  },

  // PACKAGES
  {
    id: "pkg-feature",
    title: "Commercial & Feature Production Packages",
    category: "Packages",
    description: "Curated cinema kits with tiered multi-day discounts (Weekend 2-day, Weekly 4-day rate).",
    href: "/packages",
    icon: Package,
    badge: "Save 40%",
  },

  // CAMERAS
  {
    id: "cam-arri-alexa-35",
    title: "ARRI Alexa 35 (4.6K Super 35)",
    category: "Cameras",
    description: "17 stops of dynamic range, ALEV 4 sensor, and REVEAL Color Science.",
    href: "/gear/arri-alexa-35",
    icon: Camera,
    badge: "Flagship",
  },
  {
    id: "cam-arri-mini-lf",
    title: "ARRI Alexa Mini LF (Large Format 4.5K)",
    category: "Cameras",
    description: "Full frame large-format cinematic organic roll-off with LPL mount.",
    href: "/gear/arri-alexa-mini-lf",
    icon: Camera,
  },
  {
    id: "cam-red-v-raptor",
    title: "RED V-Raptor 8K VV (VistaVision)",
    category: "Cameras",
    description: "8K 120fps VistaVision multi-format cinema sensor with REDCODE RAW.",
    href: "/gear/red-v-raptor",
    icon: Camera,
  },
  {
    id: "cam-sony-fx6",
    title: "Sony FX6 Cinema Line",
    category: "Cameras",
    description: "Full-frame 4K 120fps low-light specialist with variable electronic ND.",
    href: "/gear/sony-fx6",
    icon: Camera,
  },

  // LENSES
  {
    id: "lens-cooke-s4",
    title: "Cooke S4/i Prime Lens Set",
    category: "Lenses & Optics",
    description: "Classic Cooke Look with warm cinematic skin tones and /i technology.",
    href: "/explore",
    icon: Sparkles,
  },
  {
    id: "lens-atlas-orion",
    title: "Atlas Orion 2.0x Anamorphic Primes",
    category: "Lenses & Optics",
    description: "2x anamorphic squeeze with vintage waterfall bokeh and streak flares.",
    href: "/explore",
    icon: Sparkles,
  },

  // NAVIGATION
  {
    id: "nav-explore",
    title: "Explore Full Cinema Inventory",
    category: "Navigation",
    description: "Browse 3D showroom, cameras, optics, lighting, and audio rigs.",
    href: "/explore",
    icon: Compass,
  },
  {
    id: "nav-process",
    title: "Rental Process & Verification Guide",
    category: "Navigation",
    description: "How our white-glove Pelican dispatch, COI verification, and returns work.",
    href: "/rental-process",
    icon: Shield,
  },
  {
    id: "nav-faq",
    title: "Frequently Asked Questions (FAQ)",
    category: "Navigation",
    description: "Insurance requirements, deposit holds, transit buffers, and cancellations.",
    href: "/faq",
    icon: HelpCircle,
  },
];

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter items
  const filteredItems = SEARCH_ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open
          setQuery("");
          setSelectedIndex(0);
        }
      }

      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          router.push(filteredItems[selectedIndex].href);
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, filteredItems, selectedIndex, router]);

  if (!isOpen) return null;

  const handleSelect = (item: SearchItem) => {
    router.push(item.href);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/20 bg-neutral-950 shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5 bg-neutral-900/90">
          <Search className="h-5 w-5 text-amber-400" />
          <input
            type="text"
            placeholder="Search gear, anamorphic lenses, calculators, manifests... (↑ ↓ to navigate)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            autoFocus
            className="w-full bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none font-mono"
          />
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-neutral-500">
              No matching camera gear or tools found for &quot;{query}&quot;.
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-xs transition-all ${
                    isSelected
                      ? "bg-amber-400/10 border border-amber-400/40 text-white shadow-sm"
                      : "border border-transparent text-neutral-300 hover:bg-neutral-900"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected ? "bg-amber-400 text-black" : "bg-neutral-900 text-neutral-400"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white truncate">{item.title}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 truncate mt-0.5 font-sans">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase">{item.category}</span>
                    <ArrowRight
                      className={`h-3.5 w-3.5 transition-transform ${
                        isSelected ? "text-amber-400 translate-x-0.5" : "text-neutral-600"
                      }`}
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-white/10 bg-neutral-900/60 px-4 py-2 text-[10px] font-mono text-neutral-400">
          <div className="flex items-center gap-3">
            <span><kbd className="rounded bg-neutral-800 px-1 py-0.5 text-neutral-300">↑</kbd> <kbd className="rounded bg-neutral-800 px-1 py-0.5 text-neutral-300">↓</kbd> Navigate</span>
            <span><kbd className="rounded bg-neutral-800 px-1 py-0.5 text-neutral-300">↵</kbd> Select</span>
            <span><kbd className="rounded bg-neutral-800 px-1 py-0.5 text-neutral-300">ESC</kbd> Close</span>
          </div>
          <span className="text-amber-400">AUREVIA Fast-Command</span>
        </div>
      </div>
    </div>
  );
}
