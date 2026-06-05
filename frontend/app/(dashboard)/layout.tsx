import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import SidebarWithSubmenu from "@/components/ui/sidebar-with-submenu";
import { Header } from "@/components/Header";
import { RetentionNudgeWrapper } from "@/components/intelligence/RetentionNudgeWrapper";
import { PlanExpiryBanner } from "@/components/pricing/PlanExpiryBanner";
import MobileSafePage from "@/components/layout/MobileSafePage";

// Dashboard pages are behind auth — prevent indexing
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="flex bg-background relative break-words" style={{ height: '100dvh' }}>
      {/* Sidebar — contains its own mobile top bar + bottom nav logic */}
      <SidebarWithSubmenu />

      <div className="flex flex-col flex-1 relative min-w-0 transition-all overflow-hidden">
        <Header />
        <PlanExpiryBanner />

        <main className="flex-1 overflow-y-auto">
          <MobileSafePage>
            {children}
          </MobileSafePage>
        </main>
      </div>

      {/* Layer 5: Retention nudge — floats across all dashboard pages */}
      <RetentionNudgeWrapper />
    </div>
  );
}

