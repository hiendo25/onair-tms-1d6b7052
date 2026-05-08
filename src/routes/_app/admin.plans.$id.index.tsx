import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Check, X, ChevronDown, Send, Trash2 } from "lucide-react";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { supabase } from "@/integrations/supabase/client";
import { fetchPlanFull, PLAN_STATUS_BADGE } from "@/lib/plan-helpers";
import { useAuth } from "@/lib/auth-context";
import { useOrg } from "@/lib/org-context";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin/plans/$id/")({
  head: () => ({ meta: [{ title: "Chi tiết kế hoạch — OnAir TMS" }] }),
  component: PlanDetail,
});

function PlanDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const { orgId } = useOrg();
  const qc = useQueryClient();
  const nav = useNavigate();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [reason, setReason] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["plan-full", id],
    queryFn: () => fetchPlanFull(id),
  });

  const plan = data?.plan;
  const programs = data?.programs ?? [];
  const topics = data?.topics ?? [];
  const topicCourses = data?.topicCourses ?? [];
  const programCourses = data?.programCourses ?? [];
  const planSurvey = data?.planSurveys?.[0];

  const refresh = () => qc.invalidateQueries({ queryKey: ["plan-full", id] });

  async function approve() {
    const { error } = await supabase.from("plans").update({ status: "approved", approved_by: user?.id ?? null }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    // Auto-tag courses (Phase 7)
    const allCourseIds = [...topicCourses, ...programCourses].map((x: any) => x.course_id);
    if (allCourseIds.length) {
      const { data: existing } = await supabase.from("online_courses").select("id,tags,lessons_count").in("id", allCourseIds);
      for (const c of existing ?? []) {
        if ((c.lessons_count ?? 0) === 0 && !(c.tags ?? []).includes("Cần hoàn thiện tài liệu")) {
          await supabase.from("online_courses").update({ tags: [...(c.tags ?? []), "Cần hoàn thiện tài liệu"] }).eq("id", c.id);
        }
      }
    }
    toast.success("Đã duyệt kế hoạch");
    refresh();
    qc.invalidateQueries({ queryKey: ["plans", orgId] });
  }
  async function reject() {
    const { error } = await supabase.from("plans").update({ status: "rejected", rejection_reason: reason }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Đã từ chối"); setRejectOpen(false); refresh();
    qc.invalidateQueries({ queryKey: ["plans", orgId] });
  }
  async function deletePlan() {
    const { error } = await supabase.from("plans").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Đã xoá kế hoạch");
    qc.invalidateQueries({ queryKey: ["plans", orgId] });
    nav({ to: "/admin/plans" });
  }
  async function activateSurvey() {
    if (!planSurvey) return;
    await supabase.from("training_plan_surveys").update({ status: "active" }).eq("id", planSurvey.id);
    toast.success("Đã gửi khảo sát đến đối tượng");
    refresh();
  }
  async function completeSurvey() {
    if (!planSurvey) return;
    await supabase.from("training_plan_surveys").update({ status: "completed" }).eq("id", planSurvey.id);
    await supabase.from("plans").update({ status: "draft" }).eq("id", id);
    toast.success("Khảo sát hoàn tất - mở khoá bước 2-3");
    refresh();
  }

  if (isLoading) {
    return (
      <PageContainer
        title="Đang tải kế hoạch..."
        breadcrumbs={[{ title: "Kế hoạch", path: "/admin/plans" }, { title: "Đang tải..." }]}
      >
        <div className="grid gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-9 w-32" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      </PageContainer>
    );
  }
  if (!plan) return <PageContainer title="Không tìm thấy" breadcrumbs={[]}><p>Kế hoạch không tồn tại.</p></PageContainer>;

  const status = PLAN_STATUS_BADGE[plan.status];

  return (
    <PageContainer
      title={plan.title}
      breadcrumbs={[{ title: "Kế hoạch", path: "/admin/plans" }, { title: plan.code }]}
      actions={
        (plan.status === "draft" || plan.status === "rejected") && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild><Link to="/admin/plans/$id/edit" params={{ id }}><Edit className="h-4 w-4 mr-1" />Chỉnh sửa</Link></Button>
            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => setConfirmDel(true)}><Trash2 className="h-4 w-4 mr-1" />Xoá</Button>
          </div>
        )
      }
    >
      {/* 4 stat cards */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card><CardContent className="p-4"><div className="text-xs text-slate-500">Ngân sách</div><div className="text-lg font-semibold mt-1">{Number(plan.budget).toLocaleString("vi-VN")} ₫</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-slate-500">Người duyệt</div><div className="text-sm font-medium mt-1">{plan.approved_by ? "Đã duyệt" : "Chưa duyệt"}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-slate-500">Ngày tạo</div><div className="text-sm font-medium mt-1">{new Date(plan.created_at).toLocaleDateString("vi-VN")}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-slate-500">Người tạo</div><div className="text-sm font-medium mt-1">{plan.created_by?.slice(0, 8) ?? "—"}</div></CardContent></Card>
      </div>

      {/* Status bar + actions */}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Trạng thái:</span>
            <Badge variant="outline" className={status.cls}>{status.label}</Badge>
          </div>
          <div className="flex gap-2">
            {plan.status === "pending" && (
              <>
                <Button size="sm" onClick={approve} className="bg-emerald-600 hover:bg-emerald-700"><Check className="h-4 w-4 mr-1" />Duyệt</Button>
                <Button size="sm" variant="outline" onClick={() => setRejectOpen(true)}><X className="h-4 w-4 mr-1" />Từ chối</Button>
              </>
            )}
            {plan.status === "pending_survey" && planSurvey && (
              planSurvey.status === "pending" ? <Button size="sm" onClick={activateSurvey}><Send className="h-4 w-4 mr-1" />Thực hiện khảo sát</Button> :
              planSurvey.status === "active" ? <Button size="sm" variant="outline" onClick={completeSurvey}>Đóng khảo sát</Button> : null
            )}
          </div>
        </CardContent>
      </Card>

      {plan.status === "rejected" && plan.rejection_reason && (
        <Card><CardContent className="p-4 bg-red-50 border-l-4 border-red-500">
          <div className="text-xs text-red-700 font-semibold">Lý do từ chối</div>
          <div className="text-sm mt-1">{plan.rejection_reason}</div>
        </CardContent></Card>
      )}

      {plan.objective && (
        <Card><CardHeader><CardTitle>Mục tiêu kế hoạch</CardTitle></CardHeader><CardContent className="text-sm whitespace-pre-wrap">{plan.objective}</CardContent></Card>
      )}

      {/* Programs */}
      <Card>
        <CardHeader><CardTitle>Chương trình đào tạo ({programs.length})</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {programs.length === 0 && <p className="text-sm text-slate-500">Chưa có chương trình.</p>}
          {programs.map((p) => {
            const ts = topics.filter((t) => t.program_id === p.id);
            const pcs = programCourses.filter((pc: any) => pc.program_id === p.id);
            return (
              <Collapsible key={p.id} defaultOpen>
                <CollapsibleTrigger className="w-full flex items-center justify-between border rounded-md p-3 hover:bg-slate-50">
                  <div className="text-left">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-slate-500">{p.start_date} → {p.end_date}</div>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 mt-2 space-y-2">
                  {p.description && <p className="text-sm text-slate-600">{p.description}</p>}
                  {ts.map((t) => {
                    const tcs = topicCourses.filter((tc: any) => tc.topic_id === t.id);
                    return (
                      <div key={t.id} className="border-l-2 border-blue-200 pl-3">
                        <div className="font-medium text-sm">📁 {t.name}</div>
                        {t.description && <div className="text-xs text-slate-500">{t.description}</div>}
                        <ul className="mt-1 text-sm">
                          {tcs.map((tc: any) => <li key={tc.course_id}>• {tc.course?.code} — {tc.course?.title} {tc.course?.instructor && <span className="text-slate-500">({tc.course.instructor})</span>}</li>)}
                        </ul>
                      </div>
                    );
                  })}
                  {pcs.length > 0 && (
                    <div className="border-l-2 border-amber-200 pl-3">
                      <div className="text-xs font-medium text-slate-500">Khóa học trực tiếp</div>
                      <ul className="text-sm">
                        {pcs.map((pc: any) => <li key={pc.course_id}>• {pc.course?.code} — {pc.course?.title}</li>)}
                      </ul>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
          {topics.filter((t) => !t.program_id).length > 0 && (
            <div className="border rounded-md p-3">
              <div className="font-medium mb-2">Chủ đề độc lập</div>
              {topics.filter((t) => !t.program_id).map((t) => (
                <div key={t.id} className="border-l-2 border-slate-200 pl-3 mb-2">
                  <div className="text-sm font-medium">{t.name}</div>
                  <ul className="text-sm">
                    {topicCourses.filter((tc: any) => tc.topic_id === t.id).map((tc: any) => <li key={tc.course_id}>• {tc.course?.title}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Lý do từ chối</DialogTitle></DialogHeader>
          <Textarea rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Nhập lý do từ chối..." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Huỷ</Button>
            <Button onClick={reject} disabled={!reason.trim()}>Xác nhận từ chối</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete open={confirmDel} onOpenChange={setConfirmDel} onConfirm={deletePlan} description={`Xoá kế hoạch "${plan.title}"? Hành động này không thể hoàn tác.`} />
    </PageContainer>
  );
}
