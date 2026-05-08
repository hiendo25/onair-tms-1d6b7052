import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ShieldAlert, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/lib/org-context";

export function ComplianceDeadlineCard() {
  const { orgId } = useOrg();

  const { data, isLoading } = useQuery({
    queryKey: ["compliance-deadlines", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const horizon = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const [certsRes, employeesRes] = await Promise.all([
        supabase.from("user_certificates")
          .select("id, user_id, certificate_title, expires_at, status")
          .eq("org_id", orgId)
          .eq("status", "active")
          .lt("expires_at", horizon)
          .order("expires_at", { ascending: true })
          .limit(20),
        supabase.from("employees")
          .select("id, name, branch, user_id")
          .eq("org_id", orgId),
      ]);

      const empByUid = new Map(
        (employeesRes.data ?? []).filter((e) => e.user_id).map((e) => [e.user_id as string, e]),
      );

      const now = Date.now();
      return (certsRes.data ?? []).map((c) => {
        const days = c.expires_at ? Math.ceil((new Date(c.expires_at).getTime() - now) / (1000 * 60 * 60 * 24)) : Infinity;
        const emp = empByUid.get(c.user_id);
        return {
          id: c.id,
          employeeName: emp?.name ?? "Chưa liên kết tài khoản",
          employeeId: emp?.id ?? null,
          branch: emp?.branch ?? "—",
          certTitle: c.certificate_title || "Chứng nhận",
          daysLeft: days,
        };
      });
    },
  });

  const items = data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-orange-600" />
          Chứng nhận sắp hết hạn (30 ngày tới)
          {!isLoading && items.length > 0 && (
            <Badge variant="destructive" className="ml-2">{items.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-sm text-muted-foreground py-6 text-center">Đang tải...</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6 text-center">
            Không có chứng nhận nào sắp hết hạn 🎉
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Chi nhánh</TableHead>
                <TableHead>Chứng nhận</TableHead>
                <TableHead className="text-right">Còn lại</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((it) => {
                const isCritical = it.daysLeft < 7;
                const colorBadge = isCritical
                  ? "bg-red-100 text-red-700 border-red-200"
                  : "bg-orange-100 text-orange-700 border-orange-200";
                return (
                  <TableRow key={it.id} className="hover:bg-muted/40">
                    <TableCell className="font-medium">{it.employeeName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{it.branch}</TableCell>
                    <TableCell className="text-sm">{it.certTitle}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className={colorBadge}>
                        {it.daysLeft <= 0 ? "Đã hết hạn" : `Còn ${it.daysLeft} ngày`}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {it.employeeId && (
                        <Link
                          to="/admin/employees/$id/detail"
                          params={{ id: it.employeeId }}
                          className="inline-flex items-center text-primary hover:underline"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
