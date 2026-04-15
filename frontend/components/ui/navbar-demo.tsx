"use client";

import React, { useState, useEffect } from "react";
import NavBar from "@/components/ui/navbar";
import Image from "next/image";
import Link from "next/link";
import { useAuth, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";

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

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    
    // Hide when scrolling down, show only at the top (Hero Section)
    if (latest > previous && latest > 100) {
      setHidden(true);
    } else if (latest < 100) {
      setHidden(false);
    }
  });

  return (
    <motion.header 
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      initial="visible"
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed top-0 left-0 z-[100] w-full bg-white"
    >
      <div className="max-w-7xl mx-auto flex h-20 items-center justify-between px-6 lg:px-12">
        {/* Branding - Exactly as requested using the WhatsApp JPEG file */}
        <Link href="/" className="flex items-center group">
          <div className="relative h-[32px] flex items-center">
             <Image 
              src="/rifair-logo.png" 
              alt="Rifair AI" 
              width={128}
              height={32}
              className="w-auto object-contain"
              style={{ height: '32px' }}
              priority
            />
          </div>
        </Link>
        
        {/* Center Navigation Menus */}
        <div className="hidden md:flex flex-1 justify-center z-[100]">
          <NavBar list={menus} />
        </div>

        {/* Right Authentication Buttons */}
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
                <Button variant="ghost" className="font-bold text-[#1D1D1F] hover:bg-black/5 rounded-full px-6 transition-colors">
                  Login
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button className="font-bold bg-black text-white hover:bg-black/90 rounded-full px-6 shadow-xl transition-all hover:scale-105 active:scale-95">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}
