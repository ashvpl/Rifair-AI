"use client";

import { useEffect, useRef, useState } from "react";
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
  ChevronDown 
} from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

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

const SidebarWithSubmenu = () => {
  const pathname = usePathname();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Analyze", href: "/analyze", icon: ShieldAlert },
    { name: "Kit Generator", href: "/kit", icon: FileText },
    { name: "History", href: "/history", icon: History },
  ];

  const navsFooter = [
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Back to Home", href: "/", icon: Home },
  ];

  return (
    <>
      <nav className="flex flex-col w-72 h-screen border-r bg-white relative z-20">
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-center p-6 border-b border-black/[0.03] shrink-0">
            <Link href="/" className="flex items-center justify-center group w-full transition-transform hover:scale-[1.02] active:scale-[0.98]">
              <Image 
                src="/rifair-logo.png" 
                alt="Rifair AI" 
                width={128}
                height={32}
                className="w-auto object-contain"
                style={{ height: '32px' }}
                priority
                onError={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.display = 'none';
                }}
              />
            </Link>
          </div>

          <div className="overflow-y-auto flex-1 px-4 py-4">
            <ul className="text-sm font-medium space-y-1">
              {navigation.map((item, idx) => {
                const isActive = pathname === item.href;
                return (
                  <li key={idx}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-x-2 p-2.5 rounded-lg transition-all duration-150",
                        isActive
                          ? "bg-black/[0.03] text-foreground font-semibold"
                          : "text-gray-600 hover:text-foreground hover:bg-gray-50 active:bg-gray-100"
                      )}
                    >
                      <item.icon className={cn(
                        "w-5 h-5",
                        isActive ? "text-primary fill-primary/10" : "text-gray-500"
                      )} />
                      {item.name}
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
                          "flex items-center gap-x-2 p-2.5 rounded-lg transition-all duration-150",
                          isActive
                            ? "bg-black/[0.03] text-foreground font-semibold"
                            : "text-gray-600 hover:text-foreground hover:bg-gray-50 active:bg-gray-100"
                        )}
                      >
                        <item.icon className={cn(
                          "w-5 h-5",
                          isActive ? "text-primary fill-primary/10" : "text-gray-500"
                        )} />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          
          {/* Footer Profile */}
          <div className="px-4 py-6 shrink-0 border-t border-black/[0.03] bg-black/[0.01]">
            <div className="flex items-center gap-x-3 transition-opacity">
              <div className="relative group p-1">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                <UserButton 
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "h-9 w-9 border border-black/10 shadow-sm transition-all hover:scale-105 active:scale-95",
                      userButtonPopoverCard: "rounded-3xl border border-black/[0.05] shadow-2xl",
                      userButtonPopoverActionButtonText: "font-bold text-foreground",
                    }
                  }}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-black text-foreground uppercase tracking-[0.15em]">Account Profile</span>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default SidebarWithSubmenu;
