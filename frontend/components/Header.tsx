"use client";

import { UserButton, useAuth } from "@clerk/nextjs";
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
                      pathname?.split('/')[1] === 'simulate' || 
                      pathname?.split('/')[1] === 'history' || 
                      pathname?.split('/')[1] === 'settings' ||
                      pathname?.split('/')[1] === 'report';

  return (
    <header className={cn(
      "sticky top-0 w-full z-40 flex items-center px-6 lg:px-12 border-b border-black/[0.01] bg-white/50 backdrop-blur-3xl transition-all duration-500",
      isDashboard ? "justify-end h-20" : "justify-between h-[120px]"
    )}>
      {!isDashboard && (
        <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 group">
          <div className="relative h-[60px] flex items-center justify-start">
             <Image 
              src="/whatsapp-logo.jpeg" 
              alt="EquiHire AI" 
              width={128}
              height={32}
              className="w-auto object-contain"
              style={{ height: '32px' }}
              priority
            />
          </div>
        </Link>
      )}

      <div className="flex items-center space-x-6 md:space-x-12">
        {isLoaded && userId ? (
          <div className="flex items-center gap-6 md:gap-12">
            <UserButton 
              appearance={{ 
                elements: { 
                  userButtonAvatarBox: "border border-black/10 shadow-lg hover:ring-4 hover:ring-black/5 transition-all w-11 h-11",
                  userButtonPopoverMain: "bg-white border border-black/5 shadow-2xl rounded-3xl overflow-hidden",
                  userButtonBox: "gap-3",
                  userButtonPopoverCard: "rounded-3xl",
                  userButtonPopoverActionButtonText: "text-[#1D1D1F] font-bold",
                  userButtonPopoverFooter: "bg-[#F5F5F7] border-t border-black/[0.03]"
                } 
              }} 
            />
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
