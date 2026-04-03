"use client";

import React, { useState } from 'react';
import { cn } from "@/lib/utils";

interface AccordionItemData {
  id: number;
  title: string;
  imageUrl: string;
  desc?: string;
}

const AccordionItem = ({ 
  item, 
  isActive, 
  onMouseEnter 
}: { 
  item: AccordionItemData; 
  isActive: boolean; 
  onMouseEnter: () => void;
}) => {
  return (
    <div
      className={cn(
        "relative h-[500px] rounded-[2.5rem] overflow-hidden cursor-pointer",
        "transition-all duration-700 ease-in-out border border-white/5",
        isActive ? 'w-[450px] shadow-2xl' : 'w-[80px]'
      )}
      onMouseEnter={onMouseEnter}
    >
      {/* Background Image */}
      <img
        src={item.imageUrl}
        alt={item.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        onError={(e) => { 
          (e.target as HTMLImageElement).onerror = null; 
          (e.target as HTMLImageElement).src = 'https://placehold.co/450x500/2d3748/ffffff?text=Image+Error'; 
        }}
      />
      
      {/* Dynamic Overlay */}
      <div className={cn(
        "absolute inset-0 transition-opacity duration-700",
        isActive ? "bg-black/60" : "bg-black/40"
      )} />

      {/* Content for Active State */}
      <div className={cn(
        "absolute inset-0 p-10 flex flex-col justify-end transition-all duration-500",
        isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      )}>
        <h3 className="text-3xl font-black text-white mb-4 tracking-tight">{item.title}</h3>
        {item.desc && <p className="text-white/70 text-lg font-medium leading-relaxed max-w-sm">{item.desc}</p>}
      </div>

      {/* Vertical Title for Inactive State */}
      <div className={cn(
        "absolute bottom-24 left-1/2 -translate-x-1/2 transition-all duration-500 pointer-events-none",
        isActive ? "opacity-0 invisible" : "opacity-100 visible"
      )}>
        <span className="text-white/80 text-xl font-bold whitespace-nowrap rotate-90 inline-block uppercase tracking-[0.2em]">
          {item.title}
        </span>
      </div>
    </div>
  );
};

export function InteractiveAccordion({ items, className }: { items: AccordionItemData[], className?: string }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className={cn("flex flex-row items-center justify-center gap-4 py-4", className)}>
      {items.map((item, index) => (
        <AccordionItem
          key={item.id}
          item={item}
          isActive={index === activeIndex}
          onMouseEnter={() => setActiveIndex(index)}
        />
      ))}
    </div>
  );
}

export default function LandingAccordionItem() {
  const defaultItems = [
    {
      id: 1,
      title: 'Voice Assistant',
      imageUrl: 'https://images.unsplash.com/photo-1628258334105-2a0b3d6efee1?q=80&w=1974&auto=format&fit=crop',
    },
    {
       id: 2,
       title: 'AI Image Generation',
       imageUrl: 'https://images.unsplash.com/photo-1677756119517-756a188d2d94?q=80&w=2070&auto=format&fit=crop',
    },
    {
       id: 3,
       title: 'AI Chatbot',
       imageUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1974&auto=format&fit=crop',
    },
  ];

  return (
    <div className="w-full">
      <InteractiveAccordion items={defaultItems} />
    </div>
  );
}
