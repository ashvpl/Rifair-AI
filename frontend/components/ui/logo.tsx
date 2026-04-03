import { cn } from "@/lib/utils";

export function Logo({ className, color = "currentColor" }: { className?: string; color?: string }) {
  // A high-fidelity, hand-crafted SVG reconstruction of the EquiHire AI logo iconography 
  // ensuring crystal-clear transparency across all backgrounds.
  return (
    <div className={cn("flex flex-col items-center select-none", className)} style={{ color }}>
      {/* Heavy Geometric Border Top */}
      <div className="w-full h-[4px] bg-current rounded-sm mb-1" />
      
      <div className="flex items-center gap-[6px] py-1 scale-[0.75] lg:scale-[0.9] origin-center">
        {/* EQ - Bold Sans */}
        <span className="text-[36px] font-black tracking-[-0.05em] leading-none text-current">
          EQ
        </span>

        {/* High-Accuracy Interview Iconography (Two People Sitting) */}
        <svg
          viewBox="0 0 100 64"
          className="h-12 w-auto fill-current"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Person Left - profile sitting */}
          <circle cx="28" cy="12" r="7.5" />
          <path d="M14,24 H28 C34,24 38,28 38,34 V52 H32 V40 H14 C10,40 10,24 14,24 Z" />
          {/* Chair Leg / Seat Detail */}
          <path d="M38,52 H42 V56 H38 Z" opacity="0.3" />

          {/* Person Right - mirrored sitting profile */}
          <circle cx="72" cy="12" r="7.5" />
          <path d="M86,24 H72 C66,24 62,28 62,34 V52 H68 V40 H86 C90,40 90,24 86,24 Z" />
          {/* Chair Leg / Seat Detail */}
          <path d="M62,52 H58 V56 H62 Z" opacity="0.3" />
        </svg>

        {/* HIRE AI - Bold Sans */}
        <span className="text-[36px] font-black tracking-[-0.05em] leading-none text-current uppercase">
          HIRE AI
        </span>
      </div>
      
      {/* Heavy Geometric Border Bottom */}
      <div className="w-full h-[4px] bg-current rounded-sm mt-1" />
    </div>
  );
}
