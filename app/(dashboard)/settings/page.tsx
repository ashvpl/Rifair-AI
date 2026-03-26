"use client";

import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { UserProfile } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, Bell, User, Cpu } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
        <p className="text-slate-500">Manage your account preferences and analysis configurations.</p>
      </div>

      <div className="grid gap-6">
        {/* Account Profile Card */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-4 pb-2 border-b border-slate-50">
            <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
              <User className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Account Profile</CardTitle>
              <CardDescription>Update your personal information and security credentials.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-8 overflow-hidden">
            <div className="bg-white rounded-lg p-2 flex justify-center">
              <UserProfile 
                 routing="hash"
                 appearance={{
                   elements: {
                     rootBox: "w-full",
                     card: "shadow-none border-none p-0 w-full",
                     navbar: "hidden md:flex",
                     scrollBox: "shadow-none",
                     pageScrollBox: "pt-0",
                     headerTitle: "hidden",
                     headerSubtitle: "hidden"
                   }
                 }}
              />
            </div>
          </CardContent>
        </Card>

        <div className="pt-10 text-center">
           <p className="text-xs text-slate-400 font-medium uppercase tracking-widest letter-spacing-widest">
             More settings coming soon in EquiHire Pro
           </p>
        </div>
      </div>
    </div>
  );
}
