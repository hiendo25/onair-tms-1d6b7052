import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { OrgProvider } from "@/lib/org-context";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, isReady } = useAuth();

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth/signin" />;

  return (
    <OrgProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-white">
          <AppSidebar />
          <SidebarInset className="flex flex-1 flex-col bg-white">
            <AppHeader />
            <main className="flex-1 overflow-auto bg-white">
              <Outlet />
            </main>
            <footer className="border-t border-slate-200 bg-white py-3 text-center text-xs text-slate-500">
              Powered by Onair TMS
            </footer>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </OrgProvider>
  );
}
