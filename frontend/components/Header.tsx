"use client";

import { UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";

export function Header() {
  const { isLoaded, userId } = useAuth();
  
  return (
    <header className="fixed top-0 w-full z-50 flex items-center justify-between h-16 px-6 lg:px-12 border-b border-border bg-background/50 backdrop-blur-xl">
      <Link href="/" className="flex items-center gap-2 group">
        {/* Placeholder or fallback for the Logo. We apply an invert filter to make it visible on dark backgrounds if it's a black text logo */}
        <div className="relative w-32 h-8 brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity">
          {/* Use img as fallback if Next/Image requires remote config. The user provided the logo. */}
          <img src="/logo.png" alt="Equihire AI" className="object-contain w-full h-full" />
        </div>
      </Link>
      
      <nav className="hidden md:flex items-center space-x-8">
        <Link href="/analyze" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors text-glow hover:text-primary">
          Analyzer
        </Link>
        <Link href="/kit" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors text-glow hover:text-primary">
          Interview Kit
        </Link>
        <Link href="/history" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors text-glow hover:text-primary">
          Reports
        </Link>
      </nav>

      <div className="flex items-center space-x-4">
        {isLoaded && userId ? (
          <UserButton appearance={{ elements: { userButtonAvatarBox: "border border-border shadow-sm hover:ring-2 hover:ring-primary/50 transition-all" } }} />
        ) : (
          <Link href="/sign-in" className="text-sm font-medium text-foreground hover:text-primary transition-colors px-4 py-2 rounded-lg hover:bg-surface">
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
