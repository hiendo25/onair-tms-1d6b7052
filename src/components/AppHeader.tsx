import { Bell, Settings, ChevronDown, LogOut, Check } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOrg } from "@/lib/org-context";
import { useAuth } from "@/lib/auth-context";

export function AppHeader() {
  const { org, orgs, orgId, setOrg } = useOrg();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/auth/signin" });
  };
  const initials = (user?.user_metadata?.full_name || user?.email || "U")
    .split(" ")
    .map((s: string) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4">
      <SidebarTrigger />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 gap-2 px-2">
            <span
              className="flex h-6 w-6 items-center justify-center rounded text-[11px] font-semibold text-white"
              style={{ background: org.brandColor }}
            >
              {org.short.slice(0, 1)}
            </span>
            <span className="text-sm font-medium">{org.name}</span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72">
          <DropdownMenuLabel>Chuyển tổ chức</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {orgs.map((o) => (
            <DropdownMenuItem
              key={o.id}
              onSelect={() => setOrg(o.id)}
              className="gap-2"
            >
              <span
                className="flex h-6 w-6 items-center justify-center rounded text-[10px] font-semibold text-white"
                style={{ background: o.brandColor }}
              >
                {o.short}
              </span>
              <div className="flex flex-col">
                <span className="text-sm">{o.name}</span>
                <span className="text-[11px] text-muted-foreground">{o.industry}</span>
              </div>
              {o.id === orgId && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 gap-2 px-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden max-w-[140px] truncate text-sm sm:inline">
                {user?.user_metadata?.full_name || user?.email}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="truncate">{user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Hồ sơ</DropdownMenuItem>
            <DropdownMenuItem>Cài đặt</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleSignOut} className="text-destructive">
              <LogOut className="h-4 w-4" /> Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
