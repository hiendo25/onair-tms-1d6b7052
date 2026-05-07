import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, GraduationCap } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ADMIN_MENU, STUDENT_MENU, type MenuItem } from "@/lib/menu-config";
import { Button } from "@/components/ui/button";

type Role = "admin" | "student";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [role, setRole] = useState<Role>("admin");
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const items = role === "admin" ? ADMIN_MENU : STUDENT_MENU;

  const isActive = (path?: string) => !!path && pathname === path;
  const isChildActive = (item: MenuItem) =>
    item.children?.some((c) => isActive(c.path)) ?? false;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-vibrant text-primary-foreground shadow-elevated">
            <GraduationCap className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-display text-base font-semibold tracking-tight">OnAir TMS</span>
              <span className="text-[11px] text-sidebar-foreground/60">Hệ thống đào tạo</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const Icon = item.icon;
                if (!item.children?.length) {
                  return (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton asChild isActive={isActive(item.path)} tooltip={item.title}>
                        <Link to={item.path ?? "/"}>
                          {Icon && <Icon className="h-4 w-4" />}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }
                return (
                  <Collapsible
                    key={item.key}
                    defaultOpen={isChildActive(item)}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={isChildActive(item)}
                        >
                          {Icon && <Icon className="h-4 w-4" />}
                          <span>{item.title}</span>
                          <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.children.map((child) => (
                            <SidebarMenuSubItem key={child.key}>
                              <SidebarMenuSubButton asChild isActive={isActive(child.path)}>
                                <Link to={child.path ?? "/"}>
                                  <span>{child.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {!collapsed && (
        <SidebarFooter className="border-t">
          <div className="flex flex-col gap-2 p-2">
            <span className="text-xs text-muted-foreground">Chế độ xem</span>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={role === "admin" ? "default" : "outline"}
                className="flex-1 h-7 text-xs"
                onClick={() => setRole("admin")}
              >
                Admin
              </Button>
              <Button
                size="sm"
                variant={role === "student" ? "default" : "outline"}
                className="flex-1 h-7 text-xs"
                onClick={() => setRole("student")}
              >
                Học viên
              </Button>
            </div>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
