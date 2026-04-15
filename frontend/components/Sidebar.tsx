"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { History, Settings, ShieldAlert, LayoutDashboard, FileText, ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Analyze", href: "/analyze", icon: ShieldAlert },
  { name: "Kit Generator", href: "/kit", icon: FileText },
  { name: "History", href: "/history", icon: History },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Back to Home", href: "/", icon: Home },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-72 h-screen border-r border-black/[0.05] bg-white relative z-20">
      {/* Brand Section */}
      <div className="flex items-center h-[120px] px-8 border-b border-black/[0.03] relative group overflow-hidden">
        <Link href="/" className="flex items-center gap-4 group relative z-10 w-full transition-transform hover:scale-[1.02] active:scale-[0.98]">
          <div className="relative h-[60px] flex items-center justify-start">
             <Image 
              src="/rifair-logo.png" 
              alt="Rifair AI" 
              width={200}
              height={50}
              className="h-[45px] w-auto object-contain"
              priority
            />
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-4 py-3 text-[15px] font-semibold rounded-xl transition-all duration-200 relative",
                isActive
                  ? "bg-black/[0.03] text-foreground shadow-sm"
                  : "text-[#86868B] hover:text-foreground hover:bg-black/[0.01]"
              )}
            >
              <item.icon className={cn(
                "mr-3 h-5 w-5 transition-colors", 
                isActive ? "text-primary fill-primary/10" : "text-[#86868B] group-hover:text-foreground"
              )} />
              <span className="flex-1">{item.name}</span>
              {isActive && (
                <motion.div 
                   layoutId="sidebar-indicator"
                   className="w-1 h-5 bg-primary rounded-full absolute left-0"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-8 border-t border-black/[0.03] bg-black/[0.02]">
        <div className="flex items-center gap-4 transition-opacity hover:opacity-80">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)] animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-[#86868B] uppercase tracking-[0.1em] leading-none mb-1">Status</span>
            <span className="text-[11px] font-bold text-foreground">Operational</span>
          </div>
        </div>
      </div>
    </div>
  );
}
