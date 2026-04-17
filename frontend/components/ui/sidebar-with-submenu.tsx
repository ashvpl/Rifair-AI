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

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md border-b border-black/5 z-40 px-4 h-16 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center h-[32px]">
          <Image 
            src="/rifair-logo.png" 
            alt="Rifair AI" 
            width={100}
            height={100}
            className="w-auto h-full object-contain" 
            priority
          />
        </Link>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 border border-black/5 rounded-xl active:scale-95 transition-transform min-h-[44px] min-w-[44px] flex items-center justify-center bg-black/5 hover:bg-black/10"
        >
          <svg className="w-5 h-5 text-[#1D1D1F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <nav className={cn(
        "flex flex-col w-[280px] md:w-72 h-screen border-r bg-white fixed md:sticky top-0 left-0 z-50 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-xl md:shadow-none",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-center h-[80px] border-b border-black/[0.03] shrink-0 mt-2 md:mt-0">
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

          <div className="overflow-y-auto flex-1 px-4 py-4">
            <ul className="text-sm font-medium space-y-1">
              {navigation.map((item, idx) => {
                const isActive = pathname === item.href;
                return (
                  <li key={idx}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-x-2 p-3 rounded-xl transition-all duration-150",
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

            <div className="pt-4 mt-4 border-t border-black/[0.03]">
              <ul className="text-sm font-medium space-y-1">
                {navsFooter.map((item, idx) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={idx}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-x-2 p-3 rounded-xl transition-all duration-150",
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
