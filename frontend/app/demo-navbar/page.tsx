"use client";

import { MiniNavbar } from "@/components/ui/mini-navbar";
import Image from "next/image";

export default function NavbarDemo() {
  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden">
      {/* Background with higher resolution stars/dark aesthetic */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="https://images.unsplash.com/photo-1506318137071-a8e063b4b47e?q=80&w=3540&auto=format&fit=crop"
          alt="Cosmic Background"
          fill
          priority
          className="object-cover opacity-60 grayscale scale-105"
        />
        {/* Dark overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80" />
      </div>

      <MiniNavbar />

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4 pt-40 pb-20">
        <div className="space-y-12 max-w-4xl mx-auto">
          <div className="space-y-4">
            <span className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-white/60 animate-pulse">
              Dashboard UI Component
            </span>
            <h1 className="text-7xl md:text-9xl font-black text-white mb-6 tracking-tighter drop-shadow-2xl leading-none">
              MINI <br /> <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-white/80 to-white/40">NAVBAR</span>
            </h1>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-xl text-gray-400 font-medium">
            <span>Please support by saving this component</span>
            <div className="h-[1px] w-8 bg-white/20 hidden sm:block" />
            <button
              className="px-8 py-3 border border-white/20 bg-white/5 backdrop-blur-md rounded-full text-white font-bold transition-all duration-300 cursor-pointer text-base hover:bg-white hover:text-black hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)]
                         inline-flex items-center justify-center uppercase tracking-widest text-[12px]"
            >
              <span>Thank You</span>
            </button>
          </div>
        </div>

        {/* Content mock to test scroll behavior */}
        <div className="mt-60 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto text-left">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-10 rounded-[3rem] border border-white/10 bg-white/[0.03] backdrop-blur-2xl hover:bg-white/[0.05] transition-all duration-500 group">
              <div className="h-2 w-12 bg-white/20 rounded-full mb-8 group-hover:bg-white/40 transition-colors" />
              <h3 className="text-2xl font-bold mb-4">Space Module 0{i}</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Next-generation interface designed for high-performance data visualization and predictive AI modeling.
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
