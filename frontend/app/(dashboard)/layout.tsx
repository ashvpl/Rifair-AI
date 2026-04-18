import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SidebarWithSubmenu from "@/components/ui/sidebar-with-submenu";
import { Header } from "@/components/Header";

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
    <div className="flex h-screen bg-background overflow-hidden relative break-words">
      {/* Sidebar — contains its own mobile top bar + bottom nav logic */}
      <SidebarWithSubmenu />

      <div className="flex flex-col flex-1 relative min-w-0 transition-all overflow-hidden">
        <Header />
        
        {/*
          Main content:
          - pt-20: space below the fixed mobile top bar (<lg)
          - pb-20: space above the fixed bottom nav on mobile (<lg)
          - lg:pt-6 / lg:pb-4: reset on desktop
        */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 pt-20 lg:pt-6 pb-20 lg:pb-4">
          <div className="w-full max-w-screen-xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
