import { useState } from "react";
import { Sparkles, TrendingUp, AlertCircle, CheckSquare, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AiSpinner } from "@/components/ai/AiSpinner";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/lib/org-context";

type MonthlyReport = {
  headline: string;
  highlights: string[];
  concerns: string[];
  actions: string[];
  top_branch?: string;
  month: number;
  year: number;
  stats: { activeEmps: number; completedCount: number; passedCount: number; avgScore: string; certsCount: number };
  branchStats: { name: string; completionRate: number; employees: number }[];
};

const MONTHS = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];

export function AiMonthlyReportCard() {
  const { orgId } = useOrg();
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const { data: res, error: fnErr } = await supabase.functions.invoke("ai-monthly-report", {
        body: { orgId, month: Number(month), year: Number(year) },
      });
      if (fnErr) throw fnErr;
      setReport(res as MonthlyReport);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  }

  const years = [String(now.getFullYear() - 1), String(now.getFullYear())];

  return (
    <Card className="border-violet-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-violet-600" />
            Báo cáo tháng bằng AI
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                {MONTHS.map((m, i) => <SelectItem key={i+1} value={String(i+1)}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-24 h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                {years.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={generate} disabled={loading}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-95 text-white">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              {loading ? "Đang tạo..." : "Tạo báo cáo"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && <AiSpinner label="Đang phân tích dữ liệu tháng..." />}
        {error && !loading && <p className="text-sm text-destructive">{error}</p>}

        {report && !loading && (
          <div className="space-y-4">
            {/* Headline */}
            <div className="rounded-lg bg-gradient-to-br from-violet-50 to-fuchsia-50 border border-violet-200 p-4">
              <div className="text-xs text-violet-600 font-semibold uppercase tracking-wide mb-1">
                {MONTHS[report.month - 1]} {report.year}
              </div>
              <p className="font-semibold text-base leading-snug">{report.headline}</p>
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { label: "Nhân viên", value: report.stats.activeEmps },
                { label: "Khóa hoàn thành", value: report.stats.completedCount },
                { label: "Bài đạt", value: report.stats.passedCount },
                { label: "Điểm TB", value: report.stats.avgScore },
                { label: "Chứng chỉ mới", value: report.stats.certsCount },
              ].map((s) => (
                <div key={s.label} className="rounded-md border p-2 text-center">
                  <div className="text-lg font-bold">{s.value}</div>
                  <div className="text-[10px] text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {/* Highlights */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">
                  <TrendingUp className="h-3.5 w-3.5" /> Điểm sáng
                </div>
                <ul className="space-y-1.5">
                  {report.highlights.map((h, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="text-emerald-500 shrink-0">✓</span><span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Concerns */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">
                  <AlertCircle className="h-3.5 w-3.5" /> Cần chú ý
                </div>
                <ul className="space-y-1.5">
                  {report.concerns.map((c, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="text-amber-500 shrink-0">⚠</span><span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-700 uppercase tracking-wide mb-2">
                  <CheckSquare className="h-3.5 w-3.5" /> Hành động tháng tới
                </div>
                <ul className="space-y-1.5">
                  {report.actions.map((a, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="text-violet-600 font-bold shrink-0">{i + 1}.</span><span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Branch leaderboard */}
            {report.branchStats.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  <Building2 className="h-3.5 w-3.5" /> Xếp hạng chi nhánh
                </div>
                <div className="space-y-1.5">
                  {report.branchStats.slice(0, 5).map((b, i) => (
                    <div key={b.name} className="flex items-center gap-2">
                      <span className="w-5 text-xs text-muted-foreground shrink-0">{i + 1}</span>
                      <span className="text-sm flex-1 truncate">{b.name}</span>
                      <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-violet-500 rounded-full" style={{ width: `${b.completionRate}%` }} />
                      </div>
                      <span className="text-xs font-medium w-10 text-right">{b.completionRate}%</span>
                      {i === 0 && <Badge className="bg-amber-100 text-amber-700 text-[10px] px-1.5">🏆</Badge>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {report.top_branch && (
              <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                🏆 {report.top_branch}
              </div>
            )}
          </div>
        )}

        {!report && !loading && !error && (
          <p className="text-sm text-muted-foreground">
            Chọn tháng/năm và nhấn "Tạo báo cáo" — AI sẽ tổng hợp số liệu đào tạo, đánh giá điểm sáng, cảnh báo vấn đề và đề xuất hành động cho tháng tới.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
