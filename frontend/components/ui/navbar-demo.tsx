"use client";

import React, { useState, useEffect } from "react";
import NavBar from "@/components/ui/navbar";
import Image from "next/image";
import Link from "next/link";
import { useAuth, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { X, Menu } from "lucide-react";

const menus = [
  {
    id: 0,
    title: 'About Us',
    url: '#about-us',
    dropdown: false,
  },
  {
    id: 1,
    title: 'Analyze',
    url: '/analyze',
    dropdown: false,
  },
  {
    id: 3,
    title: 'Features',
    url: '#core-features',
    dropdown: false,
  },
];

export function NavBarDemo() {
  const { isSignedIn, isLoaded } = useAuth();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    
    if (latest > previous && latest > 100) {
      setHidden(true);
    } else if (latest < 100) {
      setHidden(false);
    }
  });

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  return (
    <>
      <motion.header 
        variants={{
          visible: { y: 0 },
          hidden: { y: "-100%" },
        }}
        initial="visible"
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 left-0 z-[100] w-full bg-white/95 backdrop-blur-sm border-b border-black/[0.04]"
      >
        <div className="max-w-7xl mx-auto flex h-16 md:h-20 items-center justify-between px-4 md:px-6 lg:px-12">
          {/* Branding */}
          <Link href="/" className="flex items-center group" onClick={() => setMobileMenuOpen(false)}>
            <div className="relative h-[36px] md:h-[40px] w-[130px] md:w-[160px] flex items-center">
              <Image 
                src="/rifair-logo.png" 
                alt="Rifair AI" 
                width={200}
                height={200}
                className="absolute left-0 h-[100px] md:h-[120px] w-auto object-contain scale-[1.5] origin-left"
                priority
              />
            </div>
          </Link>
          
          {/* Center Navigation — hidden on mobile */}
          <div className="hidden md:flex flex-1 justify-center z-[100]">
            <NavBar list={menus} />
          </div>

          {/* Right: Auth Buttons + hamburger */}
          <div className="flex items-center gap-2 md:gap-4 relative z-[100]">
            {!isLoaded ? (
              <div className="w-20 h-10 animate-pulse bg-[#F5F5F7] rounded-full" />
            ) : isSignedIn ? (
              <>
                <UserButton 
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-10 h-10 border border-black/5 hover:border-black/10 transition-all shadow-lg hover:scale-105"
                    }
                  }}
                />
              </>
            ) : (
              <>
                <Link href="/sign-in" className="hidden sm:block">
                  <Button variant="ghost" className="font-bold text-[#1D1D1F] hover:bg-black/5 rounded-full px-4 md:px-6 transition-colors">
                    Login
                  </Button>
                </Link>
                <Link href="/sign-up" className="hidden md:block">
                  <Button className="font-bold bg-black text-white hover:bg-black/90 rounded-full px-6 shadow-xl transition-all hover:scale-105 active:scale-95">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}

            {/* Hamburger — mobile only (<768px) */}
            <button
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-full text-[#1D1D1F] hover:bg-black/5 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Fullscreen Overlay Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-white z-[200] flex flex-col md:hidden"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {/* Overlay Header */}
            <div className="flex items-center justify-between px-4 h-16 border-b border-black/[0.04]">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="relative h-[36px] w-[130px] flex items-center">
                <Image 
                  src="/rifair-logo.png" 
                  alt="Rifair AI" 
                  width={200}
                  height={200}
                  className="absolute left-0 h-[100px] w-auto object-contain scale-[1.5] origin-left"
                  priority
                />
              </Link>
              <button
                className="flex items-center justify-center w-10 h-10 rounded-full text-[#1D1D1F] hover:bg-black/5 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 flex flex-col px-4 pt-8">
              {menus.map((item) => (
                <Link
                  key={item.id}
                  href={item.url}
                  className="mobile-nav-link text-[18px] font-semibold text-[#1D1D1F] py-[16px] border-b border-black/[0.06]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.title}
                </Link>
              ))}

              {/* Auth links for mobile */}
              <div className="mt-8 flex flex-col gap-3">
                {isLoaded && !isSignedIn && (
                  <>
                    <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full h-12 font-bold rounded-full text-base">
                        Login
                      </Button>
                    </Link>
                    <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full h-12 font-bold bg-black text-white rounded-full text-base">
                        Sign Up Free
                      </Button>
                    </Link>
                  </>
                )}
                {isLoaded && isSignedIn && (
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full h-12 font-bold bg-black text-white rounded-full text-base">
                      Dashboard
                    </Button>
                  </Link>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
