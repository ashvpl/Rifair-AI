"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { History, Settings, ShieldAlert, LayoutDashboard, FileText, Zap, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Analyze", href: "/analyze", icon: ShieldAlert },
  { name: "Kit Generator", href: "/kit", icon: FileText },
  { name: "Simulation", href: "/simulate", icon: Zap },
  { name: "History", href: "/history", icon: History },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-72 h-screen border-r border-border/50 bg-[#0B0F19] relative z-20">
      {/* Brand Section */}
      <div className="flex items-center h-20 px-8 border-b border-border/30 relative">
        <div className="absolute inset-0 bg-primary/5 blur-[20px] opacity-50" />
        <Link href="/" className="flex items-center gap-3 group relative z-10">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
             <span className="text-white font-black text-xs">E</span>
          </div>
          <span className="text-xl font-black text-foreground tracking-tighter group-hover:text-primary transition-colors">
            EquiHire <span className="text-primary">AI</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 relative overflow-hidden",
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface/50 border border-transparent"
              )}
            >
              <item.icon className={cn(
                "mr-3 h-5 w-5 transition-colors", 
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )} />
              <span className="flex-1">{item.name}</span>
              {isActive && (
                <motion.div 
                  layoutId="sidebar-indicator"
                  className="w-1 h-4 bg-primary rounded-full ml-auto"
                />
              )}
              {!isActive && (
                <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-40 group-hover:translate-x-0 transition-all ml-auto" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-border/30 bg-surface/20">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface/50 border border-border/30">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">System Status</span>
            <span className="text-[11px] font-bold text-foreground">Operational</span>
          </div>
        </div>
        <div className="mt-4 text-[10px] font-black text-muted-foreground/50 text-center uppercase tracking-widest">
          EquiHire AI v1.0
        </div>
      </div>
    </div>
  );
}
