import { cn } from "@/lib/utils";
import Image from "next/image";

export function Logo({ className }: { className?: string; color?: string }) {
  return (
    <div className={cn("flex flex-col items-center select-none", className)}>
      <Image 
        src="/rifair-logo.png" 
        alt="Rifair AI Logo" 
        width={90} 
        height={90} 
        className="object-contain"
        priority
      />
    </div>
  );
}
