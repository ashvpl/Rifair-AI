import React from 'react';
import { cn } from "@/lib/utils";

interface GradientCardProps {
  title: string;
  desc: string;
  gradientFrom: string;
  gradientTo: string;
  children?: React.ReactNode;
  className?: string;
}

export function GradientCard({ title, desc, gradientFrom, gradientTo, children, className }: GradientCardProps) {
  return (
    <div className={cn("group relative w-full transition-all duration-500 min-h-[400px]", className)}>
      {/* Skewed gradient panels */}
      <span
        className="absolute top-0 left-[50px] w-1/2 h-full rounded-3xl transform skew-x-[15deg] transition-all duration-500 group-hover:skew-x-0 group-hover:left-[20px] group-hover:w-[calc(100%-40px)]"
        style={{
          background: `linear-gradient(315deg, ${gradientFrom}, ${gradientTo})`,
        }}
      />
      <span
        className="absolute top-0 left-[50px] w-1/2 h-full rounded-3xl transform skew-x-[15deg] blur-[30px] transition-all duration-500 group-hover:skew-x-0 group-hover:left-[20px] group-hover:w-[calc(100%-40px)]"
        style={{
          background: `linear-gradient(315deg, ${gradientFrom}, ${gradientTo})`,
        }}
      />

      {/* Animated blurs */}
      <span className="pointer-events-none absolute inset-0 z-10">
        <span className="absolute top-0 left-0 w-0 h-0 rounded-lg opacity-0 bg-[rgba(255,255,255,0.1)] backdrop-blur-[10px] shadow-[0_5px_15px_rgba(0,0,0,0.08)] transition-all duration-500 animate-blob group-hover:top-[-40px] group-hover:left-[40px] group-hover:w-[120px] group-hover:h-[120px] group-hover:opacity-100" />
        <span className="absolute bottom-0 right-0 w-0 h-0 rounded-lg opacity-0 bg-[rgba(255,255,255,0.1)] backdrop-blur-[10px] shadow-[0_5px_15px_rgba(0,0,0,0.08)] transition-all duration-700 animate-blob animation-delay-1000 group-hover:bottom-[-40px] group-hover:right-[40px] group-hover:w-[120px] group-hover:h-[120px] group-hover:opacity-100" />
      </span>

      {/* Content */}
      <div className="relative z-20 left-0 p-8 bg-black/40 backdrop-blur-xl shadow-2xl rounded-[2.5rem] border border-white/10 text-white transition-all duration-500 group-hover:left-[-15px] group-hover:p-10 h-full">
        {title && <h2 className="text-3xl font-black mb-4 tracking-tight">{title}</h2>}
        {desc && <p className="text-lg text-white/70 leading-relaxed mb-6 font-medium">{desc}</p>}
        {children}
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translateY(10px) rotate(0deg); }
          50% { transform: translate(-10px, -20px) rotate(5deg); }
        }
        .animate-blob { animation: blob 4s ease-in-out infinite; }
        .animation-delay-1000 { animation-delay: -2s; }
      `}</style>
    </div>
  );
}

export default function SkewCards() {
  const cards = [
    {
      title: 'Card one',
      desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      gradientFrom: '#ffbc00',
      gradientTo: '#ff0058',
    },
    {
      title: 'Card two',
      desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      gradientFrom: '#03a9f4',
      gradientTo: '#ff0058',
    },
    {
      title: 'Card three',
      desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      gradientFrom: '#4dff03',
      gradientTo: '#00d0ff',
    },
  ];

  return (
    <div className="flex justify-center items-center flex-wrap py-20 gap-10">
      {cards.map((card, idx) => (
        <div key={idx} className="w-[350px]">
          <GradientCard {...card}>
            <a
              href="#"
              className="inline-flex items-center justify-center text-sm font-bold text-black bg-white px-6 py-3 rounded-full hover:bg-primary hover:text-white transition-all shadow-lg hover:shadow-primary/30"
            >
              Read More
            </a>
          </GradientCard>
        </div>
      ))}
    </div>
  );
}
