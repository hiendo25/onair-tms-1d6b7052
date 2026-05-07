import { Link } from "@tanstack/react-router";
import { Gauge, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOrg } from "@/lib/org-context";
import {
  useBranchReadiness,
  levelOf,
  levelLabel,
  levelClasses,
  scoreColor,
} from "@/lib/branch-readiness";

export function BranchReadinessSection() {
  const { orgId } = useOrg();
  const { data = [], isLoading } = useBranchReadiness(orgId);

  const sorted = [...data].sort((a, b) => a.score - b.score);
  const avg = data.length ? Math.round(data.reduce((s, d) => s + d.score, 0) / data.length) : 0;
  const avgRequired = data.length ? Math.round(data.reduce((s, d) => s + d.required, 0) / data.length) : 0;
  const avgPassed = data.length ? Math.round(data.reduce((s, d) => s + d.passed, 0) / data.length) : 0;
  const avgCerts = data.length ? Math.round(data.reduce((s, d) => s + d.certs, 0) / data.length) : 0;
  const avgActive = data.length ? Math.round(data.reduce((s, d) => s + d.active, 0) / data.length) : 0;

  const breakdown = [
    { label: "Hoàn thành KH bắt buộc", value: avgRequired, weight: "40%" },
    { label: "Pass bài kiểm tra", value: avgPassed, weight: "30%" },
    { label: "Chứng nhận còn hiệu lực", value: avgCerts, weight: "20%" },
    { label: "Học ít nhất 1 bài / 7 ngày", value: avgActive, weight: "10%" },
  ];

  const avgLevel = levelOf(avg);

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Gauge className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-slate-800">Mức độ sẵn sàng chi nhánh</h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <Card>
          <CardContent className="p-5 flex flex-col items-center justify-center gap-2">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Trung bình toàn chuỗi</div>
            <div className="text-5xl font-bold">{isLoading ? "—" : `${avg}%`}</div>
            {!isLoading && data.length > 0 && (
              <Badge variant="outline" className={levelClasses(avgLevel)}>{levelLabel(avgLevel)}</Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-3">
            {breakdown.map((b) => (
              <div key={b.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700">{b.label} <span className="text-muted-foreground">({b.weight})</span></span>
                  <span className="font-semibold tabular-nums">{isLoading ? "—" : `${b.value}%`}</span>
                </div>
                <Progress value={isLoading ? 0 : b.value} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5 space-y-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên chi nhánh</TableHead>
                <TableHead className="w-32">Score</TableHead>
                <TableHead>Hoàn thành KH</TableHead>
                <TableHead>Pass KT</TableHead>
                <TableHead>Cert hợp lệ</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Để mình xem qua nhé...</TableCell></TableRow>
              )}
              {!isLoading && sorted.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Chưa có chi nhánh nào.</TableCell></TableRow>
              )}
              {sorted.map((b) => {
                const lv = levelOf(b.score);
                return (
                  <TableRow key={b.branchId} className="hover:bg-muted/40">
                    <TableCell className="font-medium">
                      <Link to="/analytic" search={{ branch: b.branchName } as never} className="inline-flex items-center gap-1 hover:underline">
                        {b.branchName}
                        <ArrowRight className="h-3 w-3 opacity-60" />
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold tabular-nums w-9">{b.score}%</span>
                        <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full ${scoreColor(b.score)}`} style={{ width: `${b.score}%` }} />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="tabular-nums">{b.required}%</TableCell>
                    <TableCell className="tabular-nums">{b.passed}%</TableCell>
                    <TableCell className="tabular-nums">{b.certs}%</TableCell>
                    <TableCell className="tabular-nums">{b.active}%</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={levelClasses(lv)}>{levelLabel(lv)}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
