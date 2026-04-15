"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

interface MenuItem {
  title: string;
  links: {
    text: string;
    url: string;
  }[];
}

export default function FooterSection({
  tagline = "Empowering teams with precision AI hiring solutions.",
  menuItems = [
    {
      title: "Product",
      links: [
        { text: "Bias Audit", url: "/analyze" },
        { text: "Dashboard", url: "/dashboard" },
      ],
    },
    {
      title: "Company",
      links: [
        { text: "About Us", url: "/#about-us" },
        { text: "Contact", url: "mailto:support@rifair.ai" },
      ],
    },
  ],
}) {
  return (
    <footer className="bg-white py-24 border-t border-black/[0.03] relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        {/* --- Branding & Content --- */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-16 lg:gap-24">
          
          {/* Logo + Mission */}
          <div className="max-w-md">
            <div className="relative h-12 w-auto mb-6">
              <Image src="/rifair-logo.png" alt="Rifair AI" width={180} height={45} className="h-full w-auto object-contain" />
            </div>
            <div className="space-y-6">
              <h3 className="text-sm font-black text-[#1D1D1F] uppercase tracking-[0.2em]">
                Towards Equitable Hiring
              </h3>
              <p className="text-lg text-black/50 font-medium leading-[1.6] tracking-tight">
                Rifair AI is pioneering the future of ethical recruitment with advanced bias detection and skills-first evaluation tools. Empowering teams to build diverse, high-performing organizations.
              </p>
              
              <div className="flex items-center gap-3 pt-4 opacity-40 grayscale">
                 <CheckCircle2 className="h-4 w-4" />
                 <span className="text-[10px] font-bold tracking-[0.3em] uppercase">Verified Ethical AI Engine</span>
              </div>
            </div>
          </div>

          {/* --- Menu Links (multi-column) --- */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-12 lg:gap-8 flex-1">
            {menuItems.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="mb-6 text-[11px] font-black text-[#1D1D1F] uppercase tracking-[0.3em]">
                  {section.title}
                </h3>
                <ul className="space-y-4">
                  {section.links.map((link, linkIdx) => (
                    <li
                      key={linkIdx}
                    >
                      <Link 
                        href={link.url}
                        className="text-sm font-bold text-black/40 hover:text-primary transition-all duration-300 inline-block"
                      >
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
