import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
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
      {/* Sidebar - fixed width */}
      <Sidebar />
      
      <div className="flex flex-col flex-1 relative min-w-0">
        {/* We use a relative header here to not overlap the sidebar, or make the Header itself smart. 
            Since Header is fixed in its component definition, we need to adjust or create a DashboardHeader.
            For now, let's keep it but fix the layout. */}
        <Header />
        
        <main className="flex-1 overflow-y-auto p-8 pt-24">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
