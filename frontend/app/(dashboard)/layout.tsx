import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SidebarWithSubmenu from "@/components/ui/sidebar-with-submenu";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/ui/mobile-nav";

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
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Sidebar — hidden on mobile, visible md+ */}
      <div className="hidden md:flex">
        <SidebarWithSubmenu />
      </div>

      <div className="flex flex-col flex-1 relative min-w-0">
        <Header />

        {/* Main content — extra bottom padding on mobile so content clears the bottom nav */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pt-4 sm:pt-5 md:pt-6">
          <div className="max-w-7xl mx-auto w-full pb-20 md:pb-0">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom tab bar + drawer — hidden on md+ */}
      <MobileNav />
    </div>
  );
}
