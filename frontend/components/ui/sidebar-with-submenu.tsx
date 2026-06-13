"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Users,
  ClipboardCheck,
  CalendarCheck,
  BarChart3,
  ShieldCheck,
  FileText,
  Blocks,
  Settings,
  X,
  Menu,
  ChevronDown
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { UserDropdown } from "@/components/ui/user-dropdown";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/hooks/useSubscription";
import { motion, AnimatePresence } from "framer-motion";
import { listWorkflows } from "@/lib/workflows/workflowService";
import { useBackendToken } from "@/hooks/useBackendToken";

type MenuItem = { 
  name: string; 
  href: string; 
  icon: React.ElementType; 
  comingSoon?: boolean; 
  badge?: string | null; 
};

// ─── Bottom Navigation Bar (Mobile/Tablet ≤ 1023px) ───────────────────────────
export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Workflows", href: "/dashboard/workflows", icon: Layers },
    { name: "Evaluations", href: "/evaluations", icon: ClipboardCheck },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <nav className="bottom-nav lg:hidden" aria-label="Bottom navigation">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
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
  const { isLoaded, userId } = useAuth();
  const { planId, isLoading } = useSubscription();
  const { getAuthToken } = useBackendToken();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeWorkflowTitle, setActiveWorkflowTitle] = useState<string | null>(null);

  // Fetch latest workflow for the active workflow card
  useEffect(() => {
    async function fetchLatest() {
      if (!isLoaded || !userId) return;
      try {
        const token = await getAuthToken();
        if (!token) return;
        const workflows = await listWorkflows(token);
        if (Array.isArray(workflows) && workflows.length > 0) {
          setActiveWorkflowTitle(workflows[0].role_title || "Untitled Workflow");
        }
      } catch {
        // Silent — sidebar widget is non-critical
      }
    }
    fetchLatest();
  }, [isLoaded, userId, getAuthToken]);

  const navigation: MenuItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Workflows", href: "/dashboard/workflows", icon: Layers },
    { name: "History", href: "/history", icon: Users },
    { name: "Evaluations", href: "/evaluations", icon: ClipboardCheck },
    { name: "Interviews", href: "/kit", icon: CalendarCheck },
    { name: "Analytics", href: "/analyze", icon: BarChart3 },
    { name: "Integrations", href: "#coming-soon", icon: Blocks, comingSoon: true },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

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
          {/* Hamburger on the top-left */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-10 h-10 -ml-2 rounded-xl flex items-center justify-center active:scale-90 transition-transform hover:bg-black/[0.04]"
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
                  <Menu className="w-5 h-5 text-[#1D1D1F]" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* Logo and Plan Badge on the top-right */}
          <div className="flex items-center gap-3">
            {!isLoading && (
              <span className="hidden xs:inline-flex text-[9px] font-black uppercase tracking-[0.12em] px-2.5 py-1 rounded-full bg-[#F5F5F7] text-[#86868B] border border-black/[0.04]">
                {planId} plan
              </span>
            )}
            <Link href="/dashboard" className="flex items-center h-[56px] -mr-2">
              <Image
                src="/rifair-logo.png"
                alt="Rifair AI"
                width={180}
                height={180}
                className="w-auto h-full object-contain"
                priority
              />
            </Link>
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

      {/* ── Mobile Drawer Panel (slides from left) ───────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.nav
            key="drawer-panel"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            style={{
              paddingTop: "calc(56px + env(safe-area-inset-top))",
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
            className="fixed left-0 top-0 bottom-0 w-[300px] max-w-[85vw] bg-white border-r border-black/[0.06] z-[46] lg:hidden shadow-[8px_0_40px_rgba(0,0,0,0.12)] flex flex-col"
          >
            {/* Nav items */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
              <p className="text-[9px] font-black text-[#86868B] uppercase tracking-[0.18em] px-3 mb-3 mt-1">
                Navigation
              </p>
              {navigation.map((item, idx) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={idx}
                    href={item.comingSoon ? "#" : item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 min-h-[44px] group",
                      isActive
                        ? "bg-[#17141F] text-white"
                        : "text-[#6B6875] hover:bg-[#F5F5F7] active:bg-[#EBEBEB]"
                    )}
                  >
                    <item.icon className={cn(
                      "w-5 h-5 flex-shrink-0 transition-colors",
                      isActive ? "text-white" : "text-[#6B6875] group-hover:text-[#17141F]"
                    )} />
                    <span className="text-sm font-semibold">{item.name}</span>
                    {item.comingSoon && (
                      <span className="ml-auto text-[8px] font-bold px-1.5 py-0.5 rounded bg-black/[0.05] text-[#86868B] uppercase tracking-wider scale-90">
                        Soon
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Profile footer */}
            <div className="px-4 py-4 border-t border-black/[0.06] shrink-0">
              <div className="flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-[#F5F5F7] transition-colors">
                <UserDropdown />
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-black text-[#17141F] uppercase tracking-[0.12em] leading-none mb-0.5">
                    Account
                  </span>
                  <span className="text-[11px] font-medium text-[#6B6875] truncate">
                    {isLoading ? "Loading..." : `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`}
                  </span>
                </div>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* ── Desktop Sidebar (lg+) ─────────────────────────────────────────── */}
      <nav className="hidden lg:flex flex-col w-[260px] h-screen border-r border-[#E7E5EF] bg-white sticky top-0 shrink-0 z-20 overflow-y-auto scrollbar-none justify-between p-6">
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <div className="flex items-center justify-start h-14 px-2 shrink-0">
            <Link href="/dashboard" className="flex items-center">
              <img
                src="/rifair-logo.png"
                alt="Rifair AI"
                className="h-12 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Navigation */}
          <div className="space-y-1">
            {navigation.map((item, idx) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={idx}
                  href={item.comingSoon ? "#" : item.href}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-150 min-h-[42px] group text-sm font-semibold",
                    isActive
                      ? "bg-[#17141F] text-white"
                      : "text-[#6B6875] hover:text-[#17141F] hover:bg-[#F5F5F7] active:bg-[#EBEBEB]"
                  )}
                >
                  <item.icon className={cn(
                    "w-4.5 h-4.5 flex-shrink-0 transition-colors",
                    isActive ? "text-white" : "text-[#6B6875] group-hover:text-[#17141F]"
                  )} />
                  <span className="flex-1">{item.name}</span>
                  {item.comingSoon && (
                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-black/[0.05] text-[#86868B] uppercase tracking-wider shrink-0 scale-90">
                      Soon
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Lower Cards Section */}
        <div className="space-y-4 pt-6 border-t border-[#E7E5EF] mt-8">
          {/* Active Workflow Card */}
          <div className="bg-[#F8F8FB] border border-[#E7E5EF] rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#6B6875] uppercase tracking-wider">Active Workflow</span>
              <Link href="/dashboard/workflows">
                <ChevronDown className="w-3.5 h-3.5 text-[#6B6875] cursor-pointer hover:text-[#17141F] transition-colors" />
              </Link>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#17141F] truncate">
                {activeWorkflowTitle ?? "No workflows yet"}
              </p>
              <div className="flex items-center gap-1.5">
                {activeWorkflowTitle ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                    <span className="text-[10px] font-bold text-[#22C55E] uppercase tracking-wider">Active</span>
                  </>
                ) : (
                  <Link href="/dashboard/workflows/new" className="text-[10px] font-bold text-[#5B45D6] uppercase tracking-wider hover:underline">
                    + Create one
                  </Link>
                )}
              </div>
            </div>
          </div>

        </div>
      </nav>
      <BottomNav />
    </>
  );
};

export default SidebarWithSubmenu;
