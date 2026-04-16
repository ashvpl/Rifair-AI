"use client";

import { UserProfile } from "@clerk/nextjs";
import { Info } from "lucide-react";
import { dark } from "@clerk/themes";

export default function SettingsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-10 animate-in fade-in duration-1000 pb-4 pt-0">
      
      {/* Header section */}
      <div className="relative">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">System Settings</h1>
          <p className="text-[#86868B] max-w-2xl text-sm md:text-lg font-medium">
            Manage your professional identity, security protocols, and platform preferences.
          </p>
        </div>
      </div>

      <div className="grid gap-12">
        {/* Account Profile Card */}
        <div className="bg-white border border-black/[0.05] rounded-[3rem] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-all duration-500 hover:shadow-[0_8px_48px_rgba(0,0,0,0.04)] hover:border-black/[0.08]">
          <div className="p-4 md:p-10 overflow-hidden bg-white">
            <div className="max-w-full rounded-[2rem] overflow-hidden border border-black/[0.03] bg-[#F5F5F7]/10 p-2 md:p-6 shadow-inner">
              <UserProfile 
                 routing="hash"
                 appearance={{
                   elements: {
                     rootBox: "w-full",
                     card: "shadow-none border-none p-0 w-full bg-transparent mx-auto",
                     navbar: "hidden md:flex bg-white border-r border-black/[0.03] rounded-l-[1.5rem] shadow-sm",
                     scrollBox: "shadow-none bg-transparent",
                     pageScrollBox: "pt-8 px-10 pb-12",
                     headerTitle: "text-2xl font-extrabold tracking-tight text-foreground",
                     headerSubtitle: "text-[#86868B] font-medium text-sm",
                     navbarMobileMenuButton: "text-primary",
                     breadcrumbsItem: "text-[#86868B] font-bold text-[10px] uppercase tracking-widest",
                     breadcrumbsSeparator: "text-black/10",
                     badge: "bg-primary/5 text-primary border border-primary/10 font-bold",
                     profileSectionTitleText: "text-foreground font-black uppercase tracking-[0.15em] text-[10px] mt-6 mb-4 pb-2 border-b border-black/[0.03]",
                     avatarBox: "border-4 border-white shadow-xl w-24 h-24 rounded-3xl",
                     userPreviewMainIdentifier: "text-foreground font-extrabold text-lg",
                     userPreviewSecondaryIdentifier: "text-[#86868B] font-medium",
                     formButtonPrimary: "bg-black hover:bg-black/90 text-white font-heavy h-12 px-8 rounded-full shadow-lg transition-all active:scale-95",
                     formFieldLabel: "text-[#86868B] font-black text-[10px] uppercase tracking-[0.15em] mb-2",
                     formFieldInput: "bg-white border-black/[0.06] text-foreground rounded-2xl h-14 px-5 focus:ring-4 focus:ring-black/5 focus:border-black/10 transition-all font-medium",
                     footerActionText: "text-[#86868B] font-medium",
                     footerActionLink: "text-primary font-bold hover:underline",
                     identityPreviewText: "text-foreground font-bold",
                     formFieldInputGroup: "gap-4",
                     dividerRow: "border-black/[0.03]",
                     profileSection: "mb-12"
                   }
                 }}
              />
            </div>
          </div>
        </div>

      </div>
    </div>

  );
}

