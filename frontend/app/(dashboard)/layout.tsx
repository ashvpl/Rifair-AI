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
    <div className="flex h-screen bg-background overflow-hidden relative">
      <SidebarWithSubmenu />
      
      <div className="flex flex-col flex-1 relative min-w-0">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pt-20 md:pt-6">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
