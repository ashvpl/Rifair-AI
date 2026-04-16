"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldAlert,
  FileText,
  History,
  Settings,
  Home,
  X,
  Menu,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const bottomTabs = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Analyze", href: "/analyze", icon: ShieldAlert },
  { name: "Kit", href: "/kit", icon: FileText },
  { name: "History", href: "/history", icon: History },
];

const drawerLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Analyze", href: "/analyze", icon: ShieldAlert },
  { name: "Kit Generator", href: "/kit", icon: FileText },
  { name: "History", href: "/history", icon: History },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Back to Home", href: "/", icon: Home },
];

export function MobileNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <>
      {/* ── Slide-in Drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
              onClick={() => setDrawerOpen(false)}
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] bg-white shadow-2xl md:hidden flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.05]">
                <Link href="/" className="flex items-center relative h-[50px] w-[140px]">
                  <Image
                    src="/rifair-logo.png"
                    alt="Rifair AI"
                    width={200}
                    height={200}
                    className="absolute h-[100px] w-auto object-contain scale-[1.1] origin-left"
                    priority
                  />
                </Link>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 rounded-xl hover:bg-black/[0.04] transition-colors active:scale-95"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5 text-[#86868B]" />
                </button>
              </div>

              {/* Drawer links */}
              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
                {drawerLinks.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-semibold transition-all duration-150 active:scale-95",
                        isActive
                          ? "bg-black/[0.04] text-foreground"
                          : "text-[#86868B] hover:text-foreground hover:bg-black/[0.02]"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5 flex-shrink-0",
                          isActive ? "text-primary" : "text-[#86868B]"
                        )}
                      />
                      <span>{item.name}</span>
                      {isActive && (
                        <motion.div
                          layoutId="mobile-drawer-indicator"
                          className="ml-auto w-1.5 h-5 bg-primary rounded-full"
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Drawer footer */}
              <div className="px-5 py-5 border-t border-black/[0.04] bg-black/[0.01]">
                <div className="flex items-center gap-3">
                  <UserButton
                    appearance={{
                      elements: {
                        userButtonAvatarBox: "h-9 w-9 border border-black/10 shadow-sm",
                        userButtonPopoverCard: "rounded-3xl border border-black/[0.05] shadow-2xl",
                      },
                    }}
                  />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-foreground uppercase tracking-[0.15em]">
                      Account
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-[#86868B]">Operational</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Bottom Tab Bar ── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white/80 backdrop-blur-xl border-t border-black/[0.06] safe-area-bottom"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-around h-14">
          {/* Menu icon — leftmost */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex flex-col items-center justify-center gap-1 px-3 py-1 min-w-[56px] min-h-[44px] active:scale-90 transition-transform"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-[#86868B]" />
            <span className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider">
              Menu
            </span>
          </button>

          {bottomTabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-3 py-1 min-w-[56px] min-h-[44px] relative active:scale-90 transition-all duration-150",
                  isActive ? "text-foreground" : "text-[#86868B]"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="bottom-tab-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-foreground rounded-full"
                  />
                )}
                <tab.icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-foreground" : "text-[#86868B]"
                  )}
                />
                <span
                  className={cn(
                    "text-[9px] font-bold uppercase tracking-wider transition-colors",
                    isActive ? "text-foreground" : "text-[#86868B]"
                  )}
                >
                  {tab.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
