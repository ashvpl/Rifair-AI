"use client";

import { UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Header() {
  const { isLoaded, userId } = useAuth();
  
  return (
    <header className="sticky top-0 w-full z-40 flex items-center justify-between h-16 px-6 lg:px-12 border-b border-border/30 bg-background/80 backdrop-blur-md">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
             <span className="text-white font-black text-xs">E</span>
          </div>
          <span className="text-xl font-black text-foreground tracking-tighter group-hover:text-primary transition-colors">
            EquiHire <span className="text-primary">AI</span>
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/analyze" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
            Analyzer
          </Link>
          <Link href="/kit" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
            Interview Kit
          </Link>
          <Link href="/history" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
            Reports
          </Link>
        </nav>
      </div>

      <div className="flex items-center space-x-4">
        {isLoaded && userId ? (
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-muted-foreground hidden sm:block uppercase tracking-widest">Premium Account</span>
            <UserButton appearance={{ elements: { userButtonAvatarBox: "border border-border/50 shadow-sm hover:ring-2 hover:ring-primary/50 transition-all w-8 h-8" } }} />
          </div>
        ) : (
          <Link href="/sign-in" className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
