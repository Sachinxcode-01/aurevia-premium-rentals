"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, User, Menu, X, ShoppingCart } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { motion, AnimatePresence } from "motion/react";
import MagneticButton from "@/components/motion/MagneticButton";

interface NavbarProps {
  cartItemCount?: number;
  onCartClick?: () => void;
  onSearchClick?: () => void;
}

export default function Navbar({
  cartItemCount = 0,
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementActive, setAnnouncementActive] = useState(false);

  useEffect(() => {
    let active = true;
    import("@/lib/db/store").then(({ db }) => {
      if (!active) return;
      db.getWebsiteSetting("announcement_bar_text").then((val) => {
        if (val && active) setAnnouncementText(val);
      });
      db.getWebsiteSetting("announcement_bar_active").then((val) => {
        if (active) setAnnouncementActive(val === "true");
      });
    });
    return () => {
      active = false;
    };
  }, []);

  // Monitor scroll for header style transition
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 30;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      {announcementActive && announcementText && (
        <div className="fixed top-0 left-0 w-full bg-gold-champagne text-obsidian text-[9px] md:text-[10px] font-bold h-[32px] flex items-center justify-center px-4 text-center select-none z-50 tracking-wider uppercase font-mono shadow-md">
          <span>{announcementText}</span>
        </div>
      )}
      <header
        className={`fixed left-0 w-full z-40 transition-all duration-300 h-[86px] flex items-center border-b ${
          scrolled
            ? "bg-obsidian/85 backdrop-blur-xl border-gold-champagne/15 shadow-lg shadow-black/80"
            : "bg-obsidian/30 backdrop-blur-md border-white/5"
        }`}
        style={{ top: announcementActive && announcementText ? "32px" : "0" }}
      >
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-full">
          {/* Brand Logo & Premium Badge */}
          <Link href="/" className="flex items-center gap-1.5 xl:gap-2 group select-none shrink-0" aria-label="AUREVIA Premium Camera Rentals">
            <Logo variant="wordmark" theme="light" width={140} height={38} />
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
                    isActive ? "text-gold-champagne" : "text-ivory/80 hover:text-gold-champagne"
                  }`}
                >
                  {link.name}
                  {isActive ? (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute bottom-[-6px] left-0 w-full h-[1.5px] bg-gold-champagne"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  ) : (
                    <span className="absolute bottom-[-6px] left-0 w-0 h-[1.5px] bg-gold-champagne transition-all duration-300 group-hover:w-full" />
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
                className="bg-white/5 border border-white/10 text-xs xl:text-sm text-ivory rounded-full px-4 h-10 xl:h-11 pr-8 xl:pr-10 focus:outline-none focus:border-gold-champagne/50 w-24 xl:w-44 focus:w-36 xl:focus:w-56 transition-all duration-300 placeholder:text-muted-gray/50 leading-none"
              />
              <button type="submit" className="absolute right-3 text-muted-gray hover:text-gold-champagne transition-colors cursor-pointer flex items-center justify-center">
                <Search size={14} className="stroke-[2]" />
              </button>
            </form>

            {/* Cart Icon */}
            <Link
              href="/booking"
              className="relative text-ivory/80 hover:text-gold-champagne transition duration-300 flex items-center p-1"
            >
              <ShoppingCart className="w-[18px] h-[18px] xl:w-[20px] xl:h-[20px] stroke-[2]" />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 bg-gold-champagne text-obsidian text-[8px] xl:text-[9px] font-bold w-3.5 h-3.5 xl:w-4 xl:h-4 rounded-full flex items-center justify-center animate-pulse">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* Customer Account Dashboard */}
            <Link
              href="/dashboard"
              className="text-ivory/80 hover:text-gold-champagne transition duration-300 p-1 flex items-center"
            >
              <User className="w-[18px] h-[18px] xl:w-[20px] xl:h-[20px] stroke-[2]" />
            </Link>

            {/* Magnetic CTA Book Now */}
            <MagneticButton onClick={() => router.push("/booking")}>
              <div className="h-10 xl:h-11 px-4 xl:px-6 bg-gold-champagne text-obsidian text-[11px] xl:text-[13px] font-bold uppercase tracking-wider xl:tracking-widest rounded shadow hover:bg-gold-champagne/90 transition-colors duration-300 cursor-pointer flex items-center justify-center shrink-0">
                Book Now
              </div>
            </MagneticButton>
          </div>

          {/* Mobile Header Actions (Visible on screens < lg) */}
          <div className="flex lg:hidden items-center gap-4">
            {/* Mobile Cart */}
            <Link
              href="/booking"
              className="relative text-ivory/80 hover:text-gold-champagne transition flex items-center p-1.5"
            >
              <ShoppingCart size={20} className="stroke-[2]" />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 bg-gold-champagne text-obsidian text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* Burger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="text-ivory/80 hover:text-gold-champagne transition duration-300 focus:outline-none p-1.5 cursor-pointer flex items-center"
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
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 overflow-hidden flex flex-col bg-obsidian/95 backdrop-blur-2xl"
          >
            {/* Ambient light source inside mobile menu */}
            <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[150vw] h-[70vh] bg-gold-champagne/10 blur-[120px] pointer-events-none z-0" />

            {/* Mobile Header */}
            <div className="relative z-10 px-6 py-6 flex items-center justify-between border-b border-white/5">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2" aria-label="AUREVIA Premium Camera Rentals">
                <Logo variant="monogram" theme="light" width={32} height={32} />
              </Link>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-ivory/80 hover:text-gold-champagne transition duration-300 focus:outline-none p-1.5 cursor-pointer flex items-center"
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
                  className="w-full bg-white/5 border border-white/10 text-sm text-ivory rounded-full px-5 py-3 pr-10 focus:outline-none focus:border-gold-champagne/50"
                />
                <button type="submit" className="absolute right-4 text-muted-gray hover:text-gold-champagne cursor-pointer">
                  <Search size={16} className="stroke-[2]" />
                </button>
              </form>
            </div>

            {/* Mobile Links */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.08, delayChildren: 0.1 },
                },
              }}
              className="relative z-10 flex-1 flex flex-col justify-center px-8 py-10 space-y-6"
            >
              {navLinks.map((link) => (
                <motion.div
                  key={link.name}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block serif-heading text-3xl font-light text-ivory hover:text-gold-champagne transition duration-300 self-start"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}

              <hr className="border-white/5 my-4" />

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="flex flex-col gap-4"
              >
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-sm text-ivory/70 hover:text-gold-champagne transition duration-300 self-start font-mono uppercase tracking-wider"
                >
                  <User size={16} className="stroke-[2]" />
                  My Account
                </Link>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/booking");
                  }}
                  className="w-full py-4 bg-gold-champagne hover:bg-gold-champagne/90 text-obsidian text-xs font-bold uppercase tracking-[0.2em] rounded transition-colors duration-300 shadow-lg shadow-gold-champagne/10 cursor-pointer"
                >
                  Book Now
                </button>
              </motion.div>
            </motion.div>

            {/* Mobile Footer Contact Details */}
            <div className="relative z-10 p-6 bg-charcoal/50 border-t border-white/5 text-center font-mono text-[10px] text-muted-gray uppercase tracking-widest">
              AUREVIA • Concierge Service • Premium Rental Experience
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
