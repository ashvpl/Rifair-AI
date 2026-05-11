"use client";

import { useAuth } from "@clerk/nextjs";
import { UserDropdown } from "@/components/ui/user-dropdown";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function Header() {
  const { isLoaded, userId } = useAuth();
  const pathname = usePathname();
  const isDashboard = pathname?.split('/')[1] === 'dashboard' || 
                      pathname?.split('/')[1] === 'analyze' || 
                      pathname?.split('/')[1] === 'kit' || 
                      pathname?.split('/')[1] === 'jd-analyser' ||
                      pathname?.split('/')[1] === 'jd' ||
                      pathname?.split('/')[1] === 'history' || 
                      pathname?.split('/')[1] === 'settings' ||
                      pathname?.split('/')[1] === 'evaluations' ||
                      pathname?.split('/')[1] === 'simulate' ||
                      pathname?.split('/')[1] === 'test-loader' ||
                      pathname?.split('/')[1] === 'report';

  if (isDashboard) return null;

  return (
    <header className={cn(
      "sticky top-0 w-full z-40 flex items-center px-6 lg:px-12 border-b border-black/[0.01] bg-white/50 backdrop-blur-3xl transition-all duration-500",
      isDashboard ? "justify-end h-20" : "justify-between h-[120px]"
    )}>
      {!isDashboard && (
        <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 group">
          <div className="relative h-[90px] flex items-center justify-start">
             <Image 
              src="/rifair-logo.png" 
              alt="Rifair AI" 
              width={90}
              height={90}
              className="w-auto object-contain"
              style={{ height: '90px' }}
              priority
            />
          </div>
        </Link>
      )}

      <div className="flex items-center space-x-6 md:space-x-12">
        {isLoaded && userId ? (
          <div className="flex items-center gap-6 md:gap-12">
            <UserDropdown />
          </div>
        ) : (
          <div className="flex items-center gap-10 md:gap-16">
            <Link 
              href="/sign-in" 
              className="text-[15px] font-black text-[#86868B] uppercase tracking-[0.25em] hover:text-[#1D1D1F] transition-colors"
            >
              Log In
            </Link>
            <Link 
              href="/sign-up" 
              className="inline-flex items-center justify-center rounded-full bg-black px-10 py-4 text-[15px] font-black uppercase tracking-[0.25em] text-white shadow-2xl hover:bg-black/90 transition-all hover:scale-105 active:scale-95"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
