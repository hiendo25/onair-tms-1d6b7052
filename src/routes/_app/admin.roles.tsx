import { createFileRoute } from "@tanstack/react-router";
import { Plus, Shield, Users } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOrgData } from "@/lib/org-context";

export const Route = createFileRoute("/_app/admin/roles")({
  head: () => ({ meta: [{ title: "Vai trò & phân quyền — OnAir LMS" }] }),
  component: RolesPage,
});

function RolesPage() {
  const data = useOrgData();
  return (
    <PageContainer
      title="Vai trò & phân quyền"
      breadcrumbs={[{ title: "Quản lý tổ chức" }, { title: "Vai trò" }]}
      actions={<Button size="sm"><Plus className="h-4 w-4" />Tạo vai trò</Button>}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.roles.map(r => (
          <Card key={r.id} className="transition-shadow hover:shadow-md">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Shield className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="font-mono text-[10px]">{r.code}</Badge>
              </div>
              <div>
                <h3 className="font-semibold">{r.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{r.description}</p>
              </div>
              <div className="flex items-center justify-between border-t pt-3 text-xs">
                <span className="text-muted-foreground">{r.permissions} quyền</span>
                <span className="flex items-center gap-1 text-muted-foreground"><Users className="h-3.5 w-3.5" />{r.users.toLocaleString("vi-VN")} người</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}

