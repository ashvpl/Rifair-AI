"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { History, Settings, ShieldAlert, LayoutDashboard, FileText, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="flex flex-col w-64 border-r bg-white h-screen">
      <div className="flex items-center h-16 px-6 border-b">
        <span className="text-xl font-bold text-indigo-600 tracking-tight">EquiHire AI</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-indigo-600" : "text-slate-400")} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        {/* Placeholder for Clerk UserButton if needed elsewhere, but sidebar is clean */}
        <div className="text-xs text-slate-400 text-center">EquiHire AI v1.0</div>
      </div>
    </div>
  );
}
