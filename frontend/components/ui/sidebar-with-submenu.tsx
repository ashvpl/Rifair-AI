"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  ShieldAlert,
  FileText,
  History,
  Settings,
  Home,
  ChevronDown,
  Crown,
  FileSearch,
  ClipboardCheck,
  X,
  LifeBuoy,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { UserDropdown } from "@/components/ui/user-dropdown";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/hooks/useSubscription";
import { motion, AnimatePresence } from "framer-motion";

type MenuItem = { name: string; href: string; icon?: React.ElementType | string };

const Menu = ({ children, items }: { children: React.ReactNode; items: MenuItem[] }) => {
  const [isOpened, setIsOpened] = useState(false);

  return (
    <div>
      <button
        className="w-full flex items-center justify-between text-gray-600 p-2 rounded-lg hover:bg-gray-50 active:bg-gray-100 duration-150"
        onClick={() => setIsOpened((v) => !v)}
        aria-expanded={isOpened}
        aria-controls="submenu"
      >
        <div className="flex items-center gap-x-2">{children}</div>
        <ChevronDown
          className={`w-5 h-5 duration-150 ${isOpened ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {isOpened && (
        <ul id="submenu" className="mx-4 px-2 border-l text-sm font-medium">
          {items.map((item, idx) => (
            <li key={idx}>
              <Link
                href={item.href}
                className="flex items-center gap-x-2 text-gray-600 p-2 rounded-lg hover:bg-gray-50 active:bg-gray-100 duration-150"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ─── Bottom Navigation Bar (Mobile/Tablet ≤ 1023px) ───────────────────────────
export function BottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isEvaluateMode = pathname === "/kit" && searchParams.get("evaluate") === "true";

  const navItems = [
    { name: "Dashboard", href: "/dashboard",   icon: LayoutDashboard },
    { name: "Analyze",   href: "/analyze",      icon: ShieldAlert },
    { name: "Kits",      href: "/kit",           icon: FileText },
    { name: "JD",        href: "/jd-analyser",  icon: FileSearch },
    { name: "History",   href: "/history",       icon: History },
  ];

  return (
    <nav className="bottom-nav lg:hidden" aria-label="Bottom navigation">
      {navItems.map((item) => {
        const isActive = isEvaluateMode ? false : pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn("bottom-nav-item", isActive && "active")}
            aria-label={item.name}
          >
            <item.icon
              style={{
                width: 22,
                height: 22,
                strokeWidth: isActive ? 2.5 : 1.75,
              }}
            />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

// ─── Main Sidebar Component ────────────────────────────────────────────────────
const SidebarWithSubmenu = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { planId, isLoading, canUse } = useSubscription();
  
  const isEvaluateMode = pathname === "/kit" && searchParams.get("evaluate") === "true";

  const navigation = [
    { name: "Dashboard",    href: "/dashboard",   icon: LayoutDashboard, badge: null },
    { name: "Analyze",      href: "/analyze",      icon: ShieldAlert,     badge: null },
    { name: "Kit Generator",href: "/kit",           icon: FileText,        badge: null },
    { name: "Job Descriptions",  href: "/jd-analyser",  icon: FileSearch,      badge: null },
    { 
      name: "Candidate Evaluations", 
      href: "/evaluations",  
      icon: ClipboardCheck,  
      badge: null 
    },
    { name: "History",      href: "/history",       icon: History,         badge: null },
  ];

  const navsFooter = [
    { name: "Settings",      href: "/settings", icon: Settings },
    { name: "Back to Home",  href: "/",         icon: Home },
    { name: "Get Help",      href: "/help",     icon: LifeBuoy },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* ── Mobile Top Bar (visible below lg) ────────────────────────────── */}
      <div
        className="lg:hidden fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md border-b border-black/[0.06] z-40 flex items-center justify-between shadow-[0_1px_12px_rgba(0,0,0,0.06)]"
        style={{
          height: "calc(56px + env(safe-area-inset-top))",
          paddingTop: "env(safe-area-inset-top)",
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
        }}
      >
        <div className="flex items-center justify-between w-full px-4 h-14">
          <Link href="/" className="flex items-center h-[30px]">
            <Image
              src="/rifair-logo.png"
              alt="Rifair AI"
              width={100}
              height={100}
              className="w-auto h-full object-contain"
              priority
            />
          </Link>

          <div className="flex items-center gap-3">
            {/* Plan badge */}
            {!isLoading && (
              <span className="hidden xs:inline-flex text-[9px] font-black uppercase tracking-[0.12em] px-2.5 py-1 rounded-full bg-[#F5F5F7] text-[#86868B] border border-black/[0.04]">
                {planId} plan
              </span>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-10 h-10 rounded-xl flex items-center justify-center active:scale-90 transition-transform hover:bg-black/[0.04] touch-target"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ opacity: 0, rotate: -45 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 45 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="w-5 h-5 text-[#1D1D1F]" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="open"
                    initial={{ opacity: 0, rotate: 45 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -45 }}
                    transition={{ duration: 0.15 }}
                  >
                    <svg className="w-5 h-5 text-[#1D1D1F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Drawer Backdrop ────────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-[3px] z-[45] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ── Mobile Drawer Panel (slides from right) ───────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.nav
            key="drawer-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            style={{
              paddingTop: "calc(56px + env(safe-area-inset-top))",
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
            className="fixed right-0 top-0 bottom-0 w-[300px] bg-white z-[46] lg:hidden shadow-[-8px_0_40px_rgba(0,0,0,0.12)] flex flex-col"
          >
            {/* Nav items */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
              <p className="text-[9px] font-black text-[#86868B] uppercase tracking-[0.18em] px-3 mb-3 mt-1">
                Navigation
              </p>
              {navigation.map((item, idx) => {
                const isActive = isEvaluateMode 
                  ? item.href === "/evaluations" 
                  : pathname === item.href;
                return (
                  <Link
                    key={idx}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3.5 rounded-2xl transition-all duration-150 min-h-[52px] group",
                      isActive
                        ? "bg-[#1D1D1F] text-white"
                        : "text-[#424245] hover:bg-[#F5F5F7] active:bg-[#EBEBEB]"
                    )}
                  >
                    <item.icon className={cn(
                      "w-5 h-5 flex-shrink-0 transition-colors",
                      isActive ? "text-white" : "text-[#86868B] group-hover:text-[#1D1D1F]"
                    )} />
                    <span className="text-[15px] font-semibold">{item.name}</span>
                    {item.badge && (
                      <span className="ml-auto text-[9px] font-black px-1.5 py-0.5 rounded-md bg-white/20 text-white uppercase tracking-wider">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* Divider */}
              <div className="my-3 h-px bg-black/[0.06] mx-3" />

              <p className="text-[9px] font-black text-[#86868B] uppercase tracking-[0.18em] px-3 mb-3">
                Account
              </p>

              {navsFooter.map((item, idx) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={idx}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3.5 rounded-2xl transition-all duration-150 min-h-[52px]",
                      isActive
                        ? "bg-[#F5F5F7] text-[#1D1D1F] font-semibold"
                        : "text-[#86868B] hover:bg-[#F5F5F7] hover:text-[#424245] active:bg-[#EBEBEB]"
                    )}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-[15px] font-medium">{item.name}</span>
                  </Link>
                );
              })}

              {/* Upgrade CTA */}
              <div className="pt-3 pb-2">
                <Link
                  href="/pricing"
                  className="flex items-center gap-3 px-3 py-3.5 rounded-2xl bg-[#1D1D1F] text-white min-h-[52px] transition-transform active:scale-[0.98] shadow-md border border-white/10"
                >
                  <Crown className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <div>
                    <p className="text-[13px] font-bold leading-tight">Upgrade Plan</p>
                    {!isLoading && planId === 'free' && (
                      <p className="text-[11px] text-emerald-300/80 mt-0.5">Unlock premium features</p>
                    )}
                  </div>
                  {!isLoading && planId === 'free' && (
                    <span className="ml-auto flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300" />
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Profile footer */}
            <div className="px-4 py-4 border-t border-black/[0.06] shrink-0">
              <div className="flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-[#F5F5F7] transition-colors">
                <UserDropdown />
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-black text-[#1D1D1F] uppercase tracking-[0.12em] leading-none mb-0.5">
                    Account
                  </span>
                  <span className="text-[11px] font-medium text-[#86868B] truncate">
                    {isLoading ? "Loading..." : `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`}
                  </span>
                </div>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* ── Desktop Sidebar (lg+) ─────────────────────────────────────────── */}
      <nav className="hidden lg:flex flex-col w-72 h-screen border-r border-black/[0.05] bg-white z-20 shadow-none">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-[80px] border-b border-black/[0.03] shrink-0">
            <Link href="/dashboard" className="flex items-center justify-center group w-full relative h-[40px]">
              <Image
                src="/rifair-logo.png"
                alt="Rifair AI"
                width={200}
                height={200}
                className="absolute h-[140px] w-auto object-contain scale-[1.25] origin-center"
                priority
                onError={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.display = 'none';
                }}
              />
            </Link>
          </div>

          {/* Nav */}
          <div className="overflow-y-auto flex-1 px-4 py-4">
            <ul className="text-sm font-medium space-y-1">
              {navigation.map((item, idx) => {
                const isActive = isEvaluateMode 
                  ? item.href === "/evaluations" 
                  : pathname === item.href;
                return (
                  <li key={idx}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-x-2 p-3 rounded-xl transition-all duration-150 min-h-[44px]",
                        isActive
                          ? "bg-black/[0.03] text-foreground font-semibold"
                          : "text-gray-600 hover:text-foreground hover:bg-gray-50 active:bg-gray-100"
                      )}
                    >
                      <item.icon className={cn(
                        "w-5 h-5 flex-shrink-0",
                        isActive ? "text-primary stroke-[2.5px]" : "text-gray-500"
                      )} />
                      <span className="flex-1">{item.name}</span>
                      {item.badge && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-primary/10 text-primary uppercase tracking-wider">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="pt-4 mt-4 border-t border-black/[0.03]">
              <ul className="text-sm font-medium space-y-1">
                {navsFooter.map((item, idx) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={idx}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-x-2 p-3 rounded-xl transition-all duration-150 min-h-[44px]",
                          isActive
                            ? "bg-black/[0.03] text-foreground font-semibold"
                            : "text-gray-600 hover:text-foreground hover:bg-gray-50 active:bg-gray-100"
                        )}
                      >
                        <item.icon className={cn(
                          "w-5 h-5",
                          isActive ? "text-primary stroke-[2.5px]" : "text-gray-500"
                        )} />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Upgrade */}
          <div className="px-4 py-2 border-t border-black/[0.03]">
            <Link
              href="/pricing"
              className={cn(
                "flex items-center gap-x-3 p-3 rounded-xl transition-all duration-150 min-h-[44px] group",
                pathname === "/pricing"
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-gray-600 hover:text-primary hover:bg-primary/[0.03]"
              )}
            >
              <div className="relative">
                <Crown className={cn(
                  "w-5 h-5 transition-colors",
                  pathname === "/pricing" ? "text-amber-500" : "text-gray-500 group-hover:text-amber-500"
                )} />
                {!isLoading && planId === 'free' && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                )}
              </div>
              <span className="text-sm font-medium">Upgrade Plan</span>
            </Link>
          </div>

          {/* Profile footer */}
          <div className="px-4 py-6 shrink-0 border-t border-black/[0.03] bg-black/[0.01]">
            <div className="flex items-center gap-x-3 transition-opacity">
              <div className="relative group p-1">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                <UserDropdown />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-black text-foreground uppercase tracking-[0.15em] mb-0.5">Account Profile</span>
                <span className="text-[10px] font-medium text-gray-500">
                  {isLoading ? "Loading..." : `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Bottom Nav (Mobile + Tablet) ──────────────────────────────────── */}
      <BottomNav />
    </>
  );
};

export default SidebarWithSubmenu;
