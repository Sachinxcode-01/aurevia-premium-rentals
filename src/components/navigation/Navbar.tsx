"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { animate, createTimeline, stagger } from "animejs";
import { Search, User, Menu, X, ShoppingCart } from "lucide-react";

interface NavbarProps {
  cartItemCount?: number;
  onCartClick?: () => void;
  onSearchClick?: () => void;
}

export default function Navbar({
  cartItemCount = 0,
  onCartClick,
  onSearchClick,
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navbarRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Magnetic Button Refs
  const bookBtnRef = useRef<HTMLButtonElement>(null);

  // Monitor scroll for header style transition
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 30;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial check
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  // Magnetic Hover Effect on CTA button
  useEffect(() => {
    const btn = bookBtnRef.current;
    if (!btn) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      animate(btn, {
        translateX: x * 0.35,
        translateY: y * 0.35,
        duration: 100,
        ease: "easeOutQuad",
      });
    };

    const handleMouseLeave = () => {
      animate(btn, {
        translateX: 0,
        translateY: 0,
        duration: 500,
        ease: "easeOutElastic(1, 0.6)",
      });
    };

    btn.addEventListener("mousemove", handleMouseMove);
    btn.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      btn.removeEventListener("mousemove", handleMouseMove);
      btn.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Mobile Menu Staggered Entry Animation
  useEffect(() => {
    if (mobileMenuOpen) {
      // Lock scroll
      document.body.style.overflow = "hidden";

      const tl = createTimeline();
      tl.add(".mobile-overlay-bg", {
        opacity: [0, 1],
        duration: 400,
        ease: "easeOutQuad",
      }).add(".mobile-menu-item", {
        opacity: [0, 1],
        translateY: [30, 0],
        delay: stagger(60),
        duration: 600,
        ease: "easeOutQuint",
      }, "-=200");
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Keyboard accessibility: Escape to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Explore Gear", href: "/explore" },
    { name: "Categories", href: "/explore#categories" },
    { name: "Rental Process", href: "/rental-process" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      <header
        ref={navbarRef}
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 h-[86px] flex items-center border-b ${
          scrolled
            ? "bg-[#080808]/85 backdrop-blur-xl border-[#D8B36A]/15 shadow-lg shadow-black/80"
            : "bg-[#080808]/30 backdrop-blur-md border-white/5"
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-full">
          {/* Brand Logo & Premium Badge */}
          <Link href="/" className="flex items-center gap-1.5 xl:gap-2 group select-none shrink-0">
            <span className="serif-heading text-lg xl:text-[22px] font-semibold tracking-wider text-[#F5F1E8] transition-colors duration-300 group-hover:text-[#D8B36A] leading-none">
              AUREVIA
            </span>
            <span className="text-[8px] xl:text-[10px] font-mono tracking-widest text-[#D8B36A] border border-[#D8B36A]/30 px-1 py-0.5 xl:px-1.5 xl:py-0.5 rounded uppercase leading-none scale-90 group-hover:bg-[#D8B36A] group-hover:text-[#080808] transition-all duration-300">
              PREMIUM
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-3.5 xl:gap-7 h-full">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`group relative py-1 text-[11px] xl:text-[13px] uppercase tracking-wider xl:tracking-widest transition duration-300 font-medium whitespace-nowrap leading-none ${
                    isActive ? "text-[#D8B36A]" : "text-[#F5F1E8]/80 hover:text-[#D8B36A]"
                  }`}
                >
                  {link.name}
                  {isActive ? (
                    <span className="absolute bottom-[-6px] left-0 w-full h-[1.5px] bg-[#D8B36A]" />
                  ) : (
                    <span className="absolute bottom-[-6px] left-0 w-0 h-[1.5px] bg-[#D8B36A] transition-all duration-300 group-hover:w-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-5 shrink-0 h-full">
            {/* Quick Search */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder="Search gear..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border border-white/10 text-xs xl:text-sm text-[#F5F1E8] rounded-full px-4 h-10 xl:h-11 pr-8 xl:pr-10 focus:outline-none focus:border-[#D8B36A]/50 w-24 xl:w-44 focus:w-36 xl:focus:w-56 transition-all duration-300 placeholder:text-muted-gray/50 leading-none"
              />
              <button type="submit" className="absolute right-3 text-muted-gray hover:text-[#D8B36A] transition-colors cursor-pointer flex items-center justify-center">
                <Search size={14} className="stroke-[2]" />
              </button>
            </form>

            {/* Cart Icon */}
            <Link
              href="/booking"
              className="relative text-[#F5F1E8]/80 hover:text-[#D8B36A] transition duration-300 flex items-center p-1"
            >
              <ShoppingCart className="w-[18px] h-[18px] xl:w-[20px] xl:h-[20px] stroke-[2]" />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#D8B36A] text-[#080808] text-[8px] xl:text-[9px] font-bold w-3.5 h-3.5 xl:w-4 xl:h-4 rounded-full flex items-center justify-center animate-pulse">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* Customer Account Dashboard */}
            <Link
              href="/dashboard"
              className="text-[#F5F1E8]/80 hover:text-[#D8B36A] transition duration-300 p-1 flex items-center"
            >
              <User className="w-[18px] h-[18px] xl:w-[20px] xl:h-[20px] stroke-[2]" />
            </Link>

            {/* Magnetic CTA Book Now */}
            <button
              ref={bookBtnRef}
              onClick={() => router.push("/booking")}
              className="h-10 xl:h-11 px-4 xl:px-6 bg-[#D8B36A] text-[#080808] text-[11px] xl:text-[13px] font-bold uppercase tracking-wider xl:tracking-widest rounded shadow hover:bg-gold-warm transition-colors duration-300 cursor-pointer flex items-center justify-center shrink-0"
            >
              Book Now
            </button>
          </div>

          {/* Mobile Header Actions (Visible on screens < lg) */}
          <div className="flex lg:hidden items-center gap-4">
            {/* Mobile Cart */}
            <Link
              href="/booking"
              className="relative text-[#F5F1E8]/80 hover:text-[#D8B36A] transition flex items-center p-1.5"
            >
              <ShoppingCart size={20} className="stroke-[2]" />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#D8B36A] text-[#080808] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* Burger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="text-[#F5F1E8]/80 hover:text-[#D8B36A] transition duration-300 focus:outline-none p-1.5 cursor-pointer flex items-center"
              aria-label="Open navigation menu"
            >
              <Menu size={22} className="stroke-[2]" />
            </button>
          </div>
        </div>
      </header>

      {/* ==============================================
          MOBILE FULL-SCREEN OVERLAY MENU
          ============================================== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex flex-col mobile-overlay-bg">
          {/* Backdrop Glass Panel */}
          <div className="absolute inset-0 bg-[#080808]/95 backdrop-blur-xl z-0" />

          {/* Ambient light source inside mobile menu */}
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[150vw] h-[70vh] gold-glow opacity-30 pointer-events-none z-0" />

          {/* Mobile Header */}
          <div className="relative z-10 px-6 py-6 flex items-center justify-between border-b border-white/5">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
              <span className="serif-heading text-[22px] font-semibold tracking-wider text-[#F5F1E8]">
                AUREVIA
              </span>
              <span className="text-[10px] font-mono tracking-widest text-[#D8B36A] border border-[#D8B36A]/30 px-1.5 py-0.5 rounded uppercase">
                PREMIUM
              </span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#F5F1E8]/80 hover:text-[#D8B36A] transition duration-300 focus:outline-none p-1.5 cursor-pointer flex items-center"
              aria-label="Close navigation menu"
            >
              <X size={22} className="stroke-[2]" />
            </button>
          </div>

          {/* Search bar inside mobile overlay */}
          <div className="relative z-10 px-6 pt-8 pb-4">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
              <input
                type="text"
                placeholder="Search premium equipment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-sm text-[#F5F1E8] rounded-full px-5 py-3 pr-10 focus:outline-none focus:border-[#D8B36A]/50"
              />
              <button type="submit" className="absolute right-4 text-muted-gray hover:text-[#D8B36A] cursor-pointer">
                <Search size={16} className="stroke-[2]" />
              </button>
            </form>
          </div>

          {/* Mobile Links */}
          <div className="relative z-10 flex-1 flex flex-col justify-center px-8 py-10 space-y-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-menu-item block serif-heading text-3xl font-light text-[#F5F1E8] hover:text-[#D8B36A] transition duration-300 self-start"
                style={{ opacity: 0 }}
              >
                {link.name}
              </Link>
            ))}

            <hr className="border-white/5 my-4" />

            <div className="mobile-menu-item flex flex-col gap-4" style={{ opacity: 0 }}>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm text-[#F5F1E8]/70 hover:text-[#D8B36A] transition duration-300 self-start font-mono uppercase tracking-wider"
              >
                <User size={16} className="stroke-[2]" />
                My Account
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push("/booking");
                }}
                className="w-full py-4 bg-[#D8B36A] hover:bg-gold-warm text-[#080808] text-xs font-bold uppercase tracking-[0.2em] rounded transition-colors duration-300 shadow-lg shadow-[#D8B36A]/10 cursor-pointer"
              >
                Book Now
              </button>
            </div>
          </div>

          {/* Mobile Footer Contact Details */}
          <div className="relative z-10 p-6 bg-rich-black/50 border-t border-white/5 text-center font-mono text-[10px] text-muted-gray uppercase tracking-widest">
            AUREVIA • Phone: 9686909048 • by Prem
          </div>
        </div>
      )}
    </>
  );
}
