"use client";

import { UserProfile } from "@clerk/nextjs";
import { User, Shield, Info, Bell, Key } from "lucide-react";
import { dark } from "@clerk/themes";

export default function SettingsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      
      {/* Header section */}
      <div className="relative">
        <div className="absolute top-0 right-10 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-10" />
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-surface border border-border rounded-full">
            <User className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Account Hub</span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">System Settings</h1>
          <p className="text-muted-foreground max-w-2xl font-medium">
            Manage your professional identity, security protocols, and platform preferences.
          </p>
        </div>
      </div>

      <div className="grid gap-10">
        {/* Account Profile Card */}
        <div className="glass-panel overflow-hidden transition-all duration-500 hover:border-primary/30">
          <div className="p-8 border-b border-border/50 bg-surface/10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                <Shield className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground tracking-tight">Professional Identity</h2>
                <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                  <Key className="w-3.5 h-3.5" /> Managed via Enterprise Authentication
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 md:p-8 overflow-hidden bg-background/30 shadow-inner">
            <div className="max-w-full rounded-2xl overflow-hidden border border-border/50 bg-[#0B0F19]">
              <UserProfile 
                 routing="hash"
                 appearance={{
                   baseTheme: dark,
                   elements: {
                     rootBox: "w-full",
                     card: "shadow-none border-none p-0 w-full bg-transparent",
                     navbar: "hidden md:flex bg-surface/20 border-r border-border/50",
                     scrollBox: "shadow-none bg-transparent",
                     pageScrollBox: "pt-4 px-8",
                     headerTitle: "text-foreground font-bold",
                     headerSubtitle: "text-muted-foreground",
                     navbarMobileMenuButton: "text-primary",
                     breadcrumbsItem: "text-muted-foreground",
                     breadcrumbsSeparator: "text-muted-foreground/30",
                     badge: "bg-primary/20 text-primary border-primary/30",
                     profileSectionTitleText: "text-foreground font-bold uppercase tracking-widest text-xs",
                     userPreviewSecondaryIdentifier: "text-muted-foreground",
                     formButtonPrimary: "bg-primary hover:bg-primary/90 text-white font-bold h-11 rounded-xl shadow-lg shadow-primary/20",
                     formFieldLabel: "text-muted-foreground font-bold text-[10px] uppercase tracking-widest",
                     formFieldInput: "bg-surface/50 border-border text-foreground rounded-xl h-12 focus:ring-primary/20",
                     input: "bg-surface border-border text-foreground",
                     avatarBox: "border-2 border-primary/20 w-16 h-16"
                   }
                 }}
              />
            </div>
          </div>
        </div>

        <div className="pt-10 flex flex-col items-center gap-6 text-center py-20 relative">
           <div className="absolute inset-0 bg-primary/5 blur-3xl -z-10 rounded-full h-1/2" />
           <div className="p-4 bg-surface rounded-full border border-border shadow-2xl relative group">
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
              <Bell className="w-6 h-6 text-muted-foreground relative z-10" />
           </div>
           <div className="space-y-2">
              <p className="text-xl font-black text-foreground uppercase tracking-widest text-glow italic">
                Advanced Features coming to <span className="text-primary italic">EquiHire Pro</span>
              </p>
              <p className="text-sm text-muted-foreground font-medium max-w-sm">
                Team management, custom bias thresholds, and API integration tools will be available in the next release.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}

