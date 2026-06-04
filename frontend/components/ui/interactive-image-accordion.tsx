"use client";

import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { INTERACTIVE_ACCORDION_DEMO_IMAGES } from "@/lib/site-images";

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
          const img = e.target as HTMLImageElement;
          img.onerror = null;
          img.style.display = 'none';
          const parent = img.parentElement;
          if (parent && !parent.querySelector('.fallback-bg')) {
            const fallback = document.createElement('div');
            fallback.className = 'fallback-bg absolute inset-0 w-full h-full';
            fallback.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)';
            parent.insertBefore(fallback, parent.firstChild);
          }
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
        <h3 className="text-base sm:text-lg lg:text-xl font-black text-white mb-2 tracking-tight whitespace-nowrap">{item.title}</h3>
        {item.desc && <p className="text-white/70 text-sm font-medium leading-relaxed max-w-sm">{item.desc}</p>}
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
      imageUrl: INTERACTIVE_ACCORDION_DEMO_IMAGES[0],
    },
    {
       id: 2,
       title: 'AI Image Generation',
       imageUrl: INTERACTIVE_ACCORDION_DEMO_IMAGES[1],
    },
    {
       id: 3,
       title: 'AI Chatbot',
       imageUrl: INTERACTIVE_ACCORDION_DEMO_IMAGES[2],
    },
  ];

  return (
    <div className="w-full">
      <InteractiveAccordion items={defaultItems} />
    </div>
  );
}
