"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/navigation/Navbar";
import { db } from "@/lib/db/store";
import { Product, MOCK_CATEGORIES, MOCK_BRANDS } from "@/lib/db/mockData";
import { useCart } from "@/hooks/useCart";
import { Search, SlidersHorizontal, Heart, RefreshCw, Star, Info, ArrowRight, Eye, X, Check } from "lucide-react";
import Link from "next/link";
import { animate, stagger } from "animejs";

function ExplorePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "";

  const { addToCart, cart } = useCart();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick View Modal
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Comparison State
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [showCompareDrawer, setShowCompareDrawer] = useState(false);

  // Wishlist State
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Date selections for product cards
  const [startDate, setStartDate] = useState("2026-07-20");
  const [endDate, setEndDate] = useState("2026-07-23");

  // Load products based on filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const list = await db.getProducts({
        search: searchQuery,
        categorySlug: selectedCategory,
        brandSlug: selectedBrand,
      });
      setProducts(list);
      setLoading(false);

      // Trigger card stagger entrance
      setTimeout(() => {
        animate(".gear-card", {
          opacity: [0, 1],
          translateY: [25, 0],
          delay: stagger(80),
          duration: 700,
          ease: "easeOutQuad",
        });
      }, 50);
    };

    fetchProducts();
  }, [searchQuery, selectedCategory, selectedBrand]);

  // Handle wishlist toggle
  const toggleWishlist = (id: string) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Handle comparison toggle
  const toggleCompare = (product: Product) => {
    setCompareList((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= 3) {
        alert("You can compare up to 3 models at a time.");
        return prev;
      }
      return [...prev, product];
    });
    setShowCompareDrawer(true);
  };

  const handleBookNow = (product: Product) => {
    addToCart(product, 1, startDate, endDate, []);
    router.push("/booking");
  };

  return (
    <div className="min-h-screen bg-obsidian text-ivory pb-20">
      <Navbar cartItemCount={cart.length} />

      {/* Hero Header spacer */}
      <div className="pt-32 pb-12 px-6 md:px-12 max-w-7xl mx-auto border-b border-white/5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-champagne font-mono block mb-2">
          Aurevia Showroom
        </span>
        <h1 className="serif-heading text-4xl md:text-5xl lg:text-6xl font-light text-ivory">
          Explore Professional <span className="text-gold">Optics & Gear</span>
        </h1>
        <p className="text-sm text-muted-gray mt-3 max-w-2xl font-light">
          Browse our curated catalog of elite cinema cameras, mirrorless bodies, prime lenses, and studio stabilization rigs.
        </p>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Sidebar */}
        <div className="space-y-8 lg:col-span-1">
          <div className="glass-panel rounded-lg p-6 border-white/5 space-y-6">
            <div className="flex items-center gap-2 text-gold-champagne font-mono text-xs uppercase tracking-wider border-b border-white/5 pb-3">
              <SlidersHorizontal size={14} />
              Filter Catalog
            </div>

            {/* Search Input */}
            <div className="space-y-2">
              <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider">Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Model or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-xs rounded p-2.5 pr-8 focus:outline-none focus:border-gold-champagne/40"
                />
                <Search size={14} className="absolute right-3 top-3.5 text-muted-gray" />
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider">Category</label>
              <div className="space-y-1.5">
                <button
                  onClick={() => setSelectedCategory("")}
                  className={`w-full text-left text-xs py-1.5 px-2.5 rounded transition ${
                    selectedCategory === "" ? "bg-gold-champagne/10 text-gold-champagne border-l-2 border-gold-champagne" : "hover:bg-white/5 text-ivory/80"
                  }`}
                >
                  All Categories
                </button>
                {MOCK_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`w-full text-left text-xs py-1.5 px-2.5 rounded transition ${
                      selectedCategory === cat.slug ? "bg-gold-champagne/10 text-gold-champagne border-l-2 border-gold-champagne" : "hover:bg-white/5 text-ivory/80"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div className="space-y-2">
              <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider">Manufacturer</label>
              <div className="space-y-1.5">
                <button
                  onClick={() => setSelectedBrand("")}
                  className={`w-full text-left text-xs py-1.5 px-2.5 rounded transition ${
                    selectedBrand === "" ? "bg-gold-champagne/10 text-gold-champagne border-l-2 border-gold-champagne" : "hover:bg-white/5 text-ivory/80"
                  }`}
                >
                  All Brands
                </button>
                {MOCK_BRANDS.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBrand(b.slug)}
                    className={`w-full text-left text-xs py-1.5 px-2.5 rounded transition ${
                      selectedBrand === b.slug ? "bg-gold-champagne/10 text-gold-champagne border-l-2 border-gold-champagne" : "hover:bg-white/5 text-ivory/80"
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Quick Rental Dates configuration */}
            <div className="space-y-3 pt-4 border-t border-white/5">
              <span className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">Estimated Rental Dates</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[8px] text-muted-gray uppercase block mb-1">Pickup</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-[10px] rounded p-1.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[8px] text-muted-gray uppercase block mb-1">Return</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-[10px] rounded p-1.5 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Catalog Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass-panel border-white/5 rounded-lg h-96 w-full animate-pulse flex flex-col justify-end p-6">
                  <div className="h-4 bg-white/10 w-2/3 mb-3 rounded"></div>
                  <div className="h-3 bg-white/10 w-1/2 rounded"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="glass-panel border-white/5 rounded-lg p-16 text-center space-y-4">
              <Info size={32} className="text-gold-champagne mx-auto" />
              <h3 className="serif-heading text-xl text-ivory">No Equipment Matches</h3>
              <p className="text-xs text-muted-gray max-w-sm mx-auto">
                We couldn&apos;t find any rental items in our active vault matching those filters. Try searching for &ldquo;Canon&rdquo; or &ldquo;Lens&rdquo;.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("");
                  setSelectedBrand("");
                }}
                className="px-4 py-2 border border-white/10 rounded text-xs text-gold-champagne hover:bg-white/5 transition"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
                const isWishlisted = wishlist.includes(product.id);
                const isCompared = compareList.some((p) => p.id === product.id);

                return (
                  <div
                    key={product.id}
                    className="gear-card opacity-0 group glass-panel border-white/5 hover:border-gold-border rounded-lg overflow-hidden flex flex-col h-[460px] relative transition-all duration-500 hover:shadow-2xl hover:shadow-gold-champagne/5"
                  >
                    {/* Reflection sweep overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none z-10" />

                    {/* Image and quick actions */}
                    <div className="h-48 overflow-hidden relative bg-black/40 flex items-center justify-center border-b border-white/5">
                      <img
                        src={product.imagePrimary}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      
                      {/* Top Action Triggers */}
                      <div className="absolute top-3 left-3 right-3 flex justify-between z-20">
                        <span className="text-[8px] font-semibold uppercase tracking-widest text-gold-champagne bg-obsidian/80 backdrop-blur border border-gold-border px-2 py-0.5 rounded">
                          ★ {product.rating}
                        </span>
                        
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => toggleWishlist(product.id)}
                            className="w-7 h-7 rounded-full bg-obsidian/80 backdrop-blur flex items-center justify-center text-ivory hover:text-rose-400 transition cursor-pointer"
                            title="Add to Wishlist"
                          >
                            <Heart size={13} fill={isWishlisted ? "#f43f5e" : "none"} className={isWishlisted ? "text-rose-500" : ""} />
                          </button>
                          <button
                            onClick={() => setQuickViewProduct(product)}
                            className="w-7 h-7 rounded-full bg-obsidian/80 backdrop-blur flex items-center justify-center text-ivory hover:text-gold-champagne transition cursor-pointer"
                            title="Quick View"
                          >
                            <Eye size={13} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Meta information */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] text-muted-gray uppercase tracking-widest font-mono">
                          <span>{MOCK_BRANDS.find((b) => b.id === product.brandId)?.name}</span>
                          <span>{MOCK_CATEGORIES.find((c) => c.id === product.categoryId)?.name}</span>
                        </div>
                        
                        <Link href={`/gear/${product.slug}`} className="block">
                          <h3 className="serif-heading text-lg font-light text-ivory group-hover:text-gold-champagne transition-colors duration-300">
                            {product.name}
                          </h3>
                        </Link>
                        
                        {/* Specifications brief */}
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1.5 border-t border-white/5">
                          {Object.entries(product.specs).slice(0, 2).map(([key, val]) => (
                            <div key={key} className="text-[10px] leading-tight">
                              <span className="text-muted-gray uppercase text-[8px] block font-mono font-light">{key}</span>
                              <span className="text-ivory/90 font-medium truncate block">{val}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 space-y-3">
                        {/* Pricing details */}
                        <div className="flex justify-between items-end border-t border-white/5 pt-3">
                          <div>
                            <span className="text-[8px] text-muted-gray uppercase block font-mono">Daily Rate</span>
                            <span className="text-sm font-semibold text-gold-champagne">₹{product.dailyPrice.toLocaleString("en-IN")}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[8px] text-muted-gray uppercase block font-mono">Weekly Special</span>
                            <span className="text-xs text-ivory/80">₹{product.weeklyPrice.toLocaleString("en-IN")}</span>
                          </div>
                        </div>

                        {/* Booking & Compare Buttons */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => toggleCompare(product)}
                            className={`py-2 text-[9px] font-semibold uppercase tracking-wider rounded border transition flex items-center justify-center gap-1 cursor-pointer ${
                              isCompared 
                                ? "bg-gold-champagne/10 border-gold-champagne text-gold-champagne" 
                                : "bg-transparent border-white/10 text-ivory hover:border-gold-champagne hover:text-gold-champagne"
                            }`}
                          >
                            <RefreshCw size={10} className={isCompared ? "animate-spin" : ""} />
                            {isCompared ? "Compared" : "Compare"}
                          </button>
                          
                          <button
                            onClick={() => handleBookNow(product)}
                            className="py-2 bg-gold-champagne text-obsidian text-[9px] font-bold uppercase tracking-wider rounded hover:bg-gold-warm transition flex items-center justify-center gap-1 cursor-pointer"
                          >
                            Book Now
                            <ArrowRight size={10} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ==============================================
          QUICK VIEW MODAL OVERLAY
          ============================================== */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={() => setQuickViewProduct(null)} />
          <div className="relative glass-panel-gold rounded-lg max-w-2xl w-full border-gold-border p-6 md:p-8 z-10 flex flex-col md:flex-row gap-6 shadow-2xl animate-fade-in">
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 text-muted-gray hover:text-gold-champagne"
            >
              <X size={18} />
            </button>

            <div className="md:w-1/2 h-52 md:h-auto overflow-hidden rounded bg-black/45 flex items-center justify-center border border-white/5">
              <img
                src={quickViewProduct.imagePrimary}
                alt={quickViewProduct.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="md:w-1/2 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-gold-champagne font-mono block">
                    {MOCK_BRANDS.find((b) => b.id === quickViewProduct.brandId)?.name}
                  </span>
                  <h3 className="serif-heading text-2xl font-light text-ivory">{quickViewProduct.name}</h3>
                </div>

                <p className="text-xs text-muted-gray leading-relaxed font-light">
                  {quickViewProduct.description}
                </p>

                <div className="space-y-1.5 border-t border-b border-white/5 py-3">
                  <span className="text-[9px] uppercase tracking-widest text-muted-gray font-mono block">Technical Specifications</span>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    {Object.entries(quickViewProduct.specs).map(([key, val]) => (
                      <div key={key}>
                        <span className="text-muted-gray uppercase text-[8px] font-mono block">{key.replace("_", " ")}</span>
                        <span className="text-ivory font-medium">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <div>
                  <span className="text-[8px] text-muted-gray uppercase block font-mono">Daily Price</span>
                  <span className="text-xl font-bold text-gold-champagne">₹{quickViewProduct.dailyPrice.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/gear/${quickViewProduct.slug}`}
                    className="px-4 py-2 border border-white/20 text-ivory text-xs font-semibold uppercase tracking-wider rounded hover:border-gold-champagne hover:text-gold-champagne transition"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleBookNow(quickViewProduct)}
                    className="px-4 py-2 bg-gold-champagne text-obsidian text-xs font-bold uppercase tracking-wider rounded hover:bg-gold-warm transition cursor-pointer"
                  >
                    Rent Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================
          COMPARISON DRAWERS (FLOATING FOOTER)
          ============================================== */}
      {showCompareDrawer && compareList.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full z-45 bg-rich-black/95 backdrop-blur-md border-t border-gold-border p-4 shadow-2xl animate-slide-up">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto">
              <div className="text-left font-mono pr-4 border-r border-white/10 hidden sm:block">
                <span className="text-[9px] uppercase tracking-widest text-gold-champagne block">Gear Comparison</span>
                <span className="text-xs text-muted-gray">{compareList.length} of 3 items</span>
              </div>

              <div className="flex gap-3">
                {compareList.map((product) => (
                  <div key={product.id} className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-full pl-2.5 pr-3 py-1 text-xs">
                    <img src={product.imagePrimary} className="w-5 h-5 rounded-full object-cover" alt="" />
                    <span className="text-ivory font-medium truncate max-w-[120px]">{product.name}</span>
                    <button
                      onClick={() => toggleCompare(product)}
                      className="text-muted-gray hover:text-rose-400 transition"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {compareList.length < 3 && (
                  <div className="hidden sm:flex items-center gap-2 border border-dashed border-white/10 rounded-full px-4 py-1 text-[10px] text-muted-gray uppercase font-mono tracking-wider">
                    Add +{3 - compareList.length} more
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={() => setCompareList([])}
                className="w-1/2 md:w-auto px-4 py-2 border border-white/10 hover:border-rose-400/30 text-muted-gray hover:text-rose-400 text-xs font-semibold uppercase tracking-wider rounded transition cursor-pointer"
              >
                Clear
              </button>
              
              <Link
                href={{
                  pathname: "/explore/compare",
                  query: { ids: compareList.map((p) => p.id).join(",") },
                }}
                className="w-1/2 md:w-auto px-6 py-2 bg-gold-champagne text-obsidian text-xs font-bold uppercase tracking-wider rounded text-center hover:bg-gold-warm transition flex items-center justify-center gap-1.5"
              >
                Compare Now
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-obsidian flex items-center justify-center text-xs font-mono text-muted-gray">LOADING VAULT CATALOG...</div>}>
      <ExplorePageContent />
    </Suspense>
  );
}
