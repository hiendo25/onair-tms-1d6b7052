import { useState } from "react";
import { Sparkles, Award, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AiSpinner } from "@/components/ai/AiSpinner";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/lib/org-context";
import { toast } from "sonner";

type EligibleRow = {
  employee_id: string;
  name: string;
  department: string;
  branch: string;
  employee_code: string;
  course_title: string;
  certificate_id: string;
};

type NotReadyRow = {
  employee_id: string;
  name: string;
  course_title: string;
  missing: string[];
};

type ReadinessResult = {
  eligible: EligibleRow[];
  not_ready: NotReadyRow[];
  total_eligible: number;
  total_not_ready: number;
  message?: string;
};

export function CertReadinessCard() {
  const { orgId } = useOrg();
  const [result, setResult] = useState<ReadinessResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [issuing, setIssuing] = useState<string | null>(null);
  const [tab, setTab] = useState<"eligible" | "not_ready">("eligible");

  async function check() {
    setLoading(true);
    setResult(null);
    try {
      const { data: res, error: fnErr } = await supabase.functions.invoke("ai-cert-readiness", {
        body: { orgId },
      });
      if (fnErr) throw fnErr;
      setResult(res as ReadinessResult);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  }

  async function issueAll() {
    if (!result?.eligible.length) return;
    setIssuing("all");
    try {
      const ids = result.eligible.map((e) => e.employee_id);
      const { data: emps } = await supabase.from("employees").select("id, user_id, name").in("id", ids);
      const map = new Map((emps ?? []).map((e) => [e.id, e]));
      const rows = result.eligible
        .map((e) => {
          const emp = map.get(e.employee_id);
          if (!emp?.user_id) return null;
          return {
            user_id: emp.user_id,
            certificate_id: e.certificate_id,
            org_id: orgId,
            certificate_title: e.course_title,
            recipient_name: emp.name ?? e.name,
            issued_at: new Date().toISOString(),
            status: "active",
          };
        })
        .filter((r): r is NonNullable<typeof r> => r !== null);
      if (!rows.length) { toast.error("Không có học viên hợp lệ."); return; }
      const { error } = await supabase.from("user_certificates").insert(rows);
      if (error) throw error;
      toast.success(`Đã cấp ${rows.length} chứng chỉ thành công.`);
      setResult((prev) => prev ? { ...prev, eligible: [], total_eligible: 0 } : prev);
    } catch (e) {
      toast.error("Cấp chứng chỉ thất bại: " + (e instanceof Error ? e.message : "Unknown"));
    } finally {
      setIssuing(null);
    }
  }

  async function issueSingle(row: EligibleRow) {
    setIssuing(row.employee_id);
    try {
      const { error } = await supabase.from("employee_certificates").insert({
        employee_id: row.employee_id,
        certificate_id: row.certificate_id,
        org_id: orgId,
        issued_at: new Date().toISOString(),
        status: "active",
      });
      if (error) throw error;
      toast.success(`Đã cấp chứng chỉ cho ${row.name}.`);
      setResult((prev) => prev ? { ...prev, eligible: prev.eligible.filter((e) => e.employee_id !== row.employee_id), total_eligible: prev.total_eligible - 1 } : prev);
    } catch (e) {
      toast.error("Thất bại: " + (e instanceof Error ? e.message : "Unknown"));
    } finally {
      setIssuing(null);
    }
  }

  return (
    <Card className="border-amber-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Award className="h-4 w-4 text-amber-500" />
            Kiểm tra điều kiện cấp chứng chỉ
          </CardTitle>
          <Button size="sm" onClick={check} disabled={loading}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-95 text-white">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            {loading ? "Đang kiểm tra..." : "Kiểm tra ngay"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && <AiSpinner label="Đang kiểm tra điều kiện..." />}

        {result?.message && !loading && (
          <p className="text-sm text-muted-foreground">{result.message}</p>
        )}

        {result && !loading && !result.message && (
          <>
            {/* Tab pills */}
            <div className="flex gap-2">
              <button
                onClick={() => setTab("eligible")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition ${tab === "eligible" ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Đủ điều kiện ({result.total_eligible})
              </button>
              <button
                onClick={() => setTab("not_ready")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition ${tab === "not_ready" ? "bg-amber-500 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              >
                <XCircle className="h-3.5 w-3.5" />
                Chưa đủ ({result.total_not_ready})
              </button>
            </div>

            {tab === "eligible" && (
              <>
                {result.eligible.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Không có nhân viên nào chờ cấp chứng chỉ.</p>
                ) : (
                  <>
                    <Button size="sm" onClick={issueAll} disabled={!!issuing} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      {issuing === "all" ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Award className="h-3.5 w-3.5 mr-1.5" />}
                      Cấp tất cả {result.total_eligible} chứng chỉ
                    </Button>
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {result.eligible.map((e) => (
                        <div key={`${e.employee_id}-${e.certificate_id}`} className="flex items-center gap-3 rounded-md border p-2.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm">{e.name}</span>
                              <Badge variant="outline" className="text-[10px]">{e.employee_code}</Badge>
                            </div>
                            <div className="text-xs text-muted-foreground truncate">{e.department} · {e.branch}</div>
                            <div className="text-xs text-emerald-700 mt-0.5">📜 {e.course_title}</div>
                          </div>
                          <Button size="sm" variant="outline" className="h-7 text-xs shrink-0 border-emerald-300 text-emerald-700"
                            onClick={() => issueSingle(e)} disabled={!!issuing}>
                            {issuing === e.employee_id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Cấp"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            {tab === "not_ready" && (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {result.not_ready.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Không có trường hợp nào.</p>
                ) : result.not_ready.slice(0, 20).map((e, i) => (
                  <div key={i} className="rounded-md border p-2.5">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-amber-500 shrink-0" />
                      <span className="font-medium text-sm">{e.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{e.course_title}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {e.missing.map((m, mi) => (
                        <Badge key={mi} variant="outline" className="text-[10px] bg-amber-50 border-amber-200 text-amber-700">{m}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {!result && !loading && (
          <p className="text-sm text-muted-foreground">
            Kiểm tra tự động toàn bộ nhân viên — ai hoàn thành khóa học và đạt điểm pass sẽ được gợi ý cấp chứng chỉ ngay lập tức.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
