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
      <SidebarWithSubmenu />
      
      <div className="flex flex-col flex-1 relative min-w-0 transition-all">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 pt-20 md:pt-6">
          <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
