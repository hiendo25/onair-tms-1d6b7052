import { useState, useMemo } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ADMIN_MENU, STUDENT_MENU, type MenuItem } from "@/lib/menu-config";
import { Button } from "@/components/ui/button";
import { useOrg } from "@/lib/org-context";

type Role = "admin" | "student";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [role, setRole] = useState<Role>("admin");
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { org } = useOrg();

  const items = role === "admin" ? ADMIN_MENU : STUDENT_MENU;
  const isActive = (path?: string) => !!path && pathname === path;
  const isChildActive = (item: MenuItem) => item.children?.some((c) => isActive(c.path)) ?? false;

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-200 bg-white">
      <SidebarHeader className="border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2 px-2 py-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-sm font-bold text-white"
            style={{ background: org.brandColor }}
          >
            {org.short.slice(0, 1)}
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-slate-900">{org.short.toLowerCase()}</span>
              <span className="text-[10px] text-slate-500">.vn</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white">
        <SidebarMenu className="px-2 py-2 gap-0.5">
          {items.map((item) => {
            const Icon = item.icon;
            if (!item.children?.length) {
              const active = isActive(item.path);
              return (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className={`h-9 rounded-md text-sm font-medium ${
                      active
                        ? "bg-blue-50 text-blue-600 hover:bg-blue-50"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <Link to={item.path ?? "/"}>
                      {Icon && <Icon className={`h-4 w-4 ${active ? "text-blue-600" : "text-slate-500"}`} />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }
            const open = isChildActive(item);
            return (
              <Collapsible key={item.key} defaultOpen={open} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className={`h-9 rounded-md text-sm font-medium ${
                        open
                          ? "bg-blue-50 text-blue-600 hover:bg-blue-50"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {Icon && <Icon className={`h-4 w-4 ${open ? "text-blue-600" : "text-slate-500"}`} />}
                      <span>{item.title}</span>
                      <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ul className="mt-0.5 space-y-0.5">
                      {item.children.map((child) => {
                        const a = isActive(child.path);
                        return (
                          <li key={child.key}>
                            <Link
                              to={child.path ?? "/"}
                              className={`flex h-8 items-center gap-2 rounded-md pl-8 pr-2 text-sm ${
                                a
                                  ? "font-medium text-blue-600"
                                  : "text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${a ? "bg-blue-600" : "bg-slate-400"}`}
                              />
                              {child.title}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {!collapsed && (
        <SidebarFooter className="border-t border-slate-200 bg-white">
          <div className="flex flex-col gap-2 p-2">
            <span className="text-[10px] uppercase tracking-wider text-slate-400">Chế độ xem</span>
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
