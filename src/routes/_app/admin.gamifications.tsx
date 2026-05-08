import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Trophy, Award, Crown, Medal, Settings as SettingsIcon, Plus, Pencil, Trash2 } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  useGamifications, useGamificationMutations,
  useGamificationSettings, useGamificationSettingsMutation,
  useLeaderboard, type DBGamification,
} from "@/lib/data-hooks";

export const Route = createFileRoute("/_app/admin/gamifications")({
  head: () => ({ meta: [{ title: "Gamification — OnAir TMS" }] }),
  component: Page,
});

const RULES: { key: keyof RulesShape; label: string; sub: string }[] = [
  { key: "course", label: "Hoàn thành khoá học", sub: "Học viên hoàn thành 1 khoá học" },
  { key: "class", label: "Hoàn thành lớp học", sub: "Hoàn thành lớp học (offline/online)" },
  { key: "phase", label: "Hoàn thành giai đoạn", sub: "Hoàn thành giai đoạn lộ trình" },
  { key: "path", label: "Hoàn thành lột trình học", sub: "Hoàn thành toàn bộ lộ trình" },
  { key: "assignment", label: "Hoàn thành bài kiểm tra", sub: "Đạt điểm yêu cầu bài kiểm tra" },
];
type RulesShape = { course: 0; class: 0; phase: 0; path: 0; assignment: 0 };

function Page() {
  return (
    <PageContainer title="Gamification" breadcrumbs={[{ title: "Tương tác" }, { title: "Gamification" }]}>
      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings"><SettingsIcon className="mr-1 h-4 w-4" />Cấu hình điểm</TabsTrigger>
          <TabsTrigger value="badges"><Award className="mr-1 h-4 w-4" />Huy hiệu</TabsTrigger>
          <TabsTrigger value="titles"><Crown className="mr-1 h-4 w-4" />Danh hiệu</TabsTrigger>
          <TabsTrigger value="leaderboard"><Trophy className="mr-1 h-4 w-4" />Bảng xếp hạng</TabsTrigger>
        </TabsList>
        <TabsContent value="settings"><SettingsTab /></TabsContent>
        <TabsContent value="badges"><EntityTab type="badge" /></TabsContent>
        <TabsContent value="titles"><EntityTab type="title" /></TabsContent>
        <TabsContent value="leaderboard"><LeaderboardTab /></TabsContent>
      </Tabs>
    </PageContainer>
  );
}

function SettingsTab() {
  const { data: s } = useGamificationSettings();
  const m = useGamificationSettingsMutation();
  const [form, setForm] = useState<any>(null);
  const value = form ?? s ?? {
    enabled: true,
    course_enabled: true, course_points: 100,
    class_enabled: true, class_points: 150,
    phase_enabled: true, phase_points: 200,
    path_enabled: true, path_points: 500,
    assignment_enabled: true, assignment_points: 50,
  };
  const set = (patch: any) => setForm({ ...value, ...patch });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Cấu hình điểm thưởng</span>
          <div className="flex items-center gap-2 text-sm font-normal">
            <span className="text-muted-foreground">Bật hệ thống Gamification</span>
            <Switch checked={value.enabled} onCheckedChange={(v) => set({ enabled: v })} />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {RULES.map(r => {
          const en = value[`${r.key}_enabled`];
          const pts = value[`${r.key}_points`];
          return (
            <div key={r.key} className="flex items-center justify-between rounded-md border p-4">
              <div className="flex items-start gap-3">
                <Switch checked={en} onCheckedChange={(v) => set({ [`${r.key}_enabled`]: v })} disabled={!value.enabled} />
                <div>
                  <div className="font-medium">{r.label}</div>
                  <div className="text-sm text-muted-foreground">{r.sub}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Input type="number" className="w-32 text-right" value={pts} disabled={!value.enabled || !en}
                  onChange={(e) => set({ [`${r.key}_points`]: Number(e.target.value) || 0 })} />
                <span className="text-sm text-muted-foreground">điểm</span>
              </div>
            </div>
          );
        })}
        <div className="flex justify-end">
          <Button onClick={() => m.mutate(value)} disabled={m.isPending}>Lưu cấu hình</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function EntityTab({ type }: { type: "badge" | "title" }) {
  const { data: rows = [] } = useGamifications();
  const m = useGamificationMutations();
  const items = useMemo(() => rows.filter(r => r.type === type), [rows, type]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DBGamification | null>(null);
  const [form, setForm] = useState({ code: "", title: "", description: "", icon: "", xp_required: 0, priority: 0, condition: "", active: true });
  const isTitle = type === "title";

  const openNew = () => { setEditing(null); setForm({ code: "", title: "", description: "", icon: "", xp_required: 0, priority: 0, condition: "", active: true }); setOpen(true); };
  const openEdit = (r: DBGamification) => {
    setEditing(r);
    setForm({ code: r.code, title: r.title, description: r.description || "", icon: r.icon || "", xp_required: r.xp_required || 0, priority: r.priority || 0, condition: r.condition || "", active: r.active });
    setOpen(true);
  };
  const save = async () => {
    const payload = { ...form, type, points: form.xp_required, badge_url: "" };
    if (editing) await m.update.mutateAsync({ id: editing.id, ...payload } as any);
    else await m.create.mutateAsync(payload as any);
    setOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{isTitle ? "Quản lý danh hiệu" : "Quản lý huy hiệu"}</span>
          <Button size="sm" onClick={openNew}><Plus className="mr-1 h-4 w-4" />Thêm {isTitle ? "danh hiệu" : "huy hiệu"}</Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead className="text-right">XP yêu cầu</TableHead>
              {isTitle && <TableHead className="text-right">Ưu tiên</TableHead>}
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && <TableRow><TableCell colSpan={isTitle ? 7 : 6} className="text-center text-muted-foreground py-8">Chưa có {isTitle ? "danh hiệu" : "huy hiệu"} nào</TableCell></TableRow>}
            {items.map(r => (
              <TableRow key={r.id}>
                <TableCell><Badge variant="outline">{r.code}</Badge></TableCell>
                <TableCell className="font-medium flex items-center gap-2">
                  {isTitle ? <Crown className="h-4 w-4 text-amber-500" /> : <Medal className="h-4 w-4 text-blue-500" />}
                  {r.title}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{r.description}</TableCell>
                <TableCell className="text-right font-mono">{r.xp_required ?? 0}</TableCell>
                {isTitle && <TableCell className="text-right font-mono">{r.priority ?? 0}</TableCell>}
                <TableCell><Badge className={r.active ? "bg-emerald-500" : "bg-muted text-muted-foreground"}>{r.active ? "Bật" : "Tắt"}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => m.remove.mutate(r.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Chỉnh sửa" : "Thêm mới"} {isTitle ? "danh hiệu" : "huy hiệu"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Mã</Label><Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} /></div>
                <div><Label>Tên</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
              </div>
              <div><Label>Mô tả</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>XP yêu cầu</Label><Input type="number" value={form.xp_required} onChange={e => setForm({ ...form, xp_required: Number(e.target.value) || 0 })} /></div>
                {isTitle && <div><Label>Mức ưu tiên (cao = ưu tiên hơn)</Label><Input type="number" value={form.priority} onChange={e => setForm({ ...form, priority: Number(e.target.value) || 0 })} /></div>}
              </div>
              <div className="flex items-center gap-2"><Switch checked={form.active} onCheckedChange={v => setForm({ ...form, active: v })} /><span className="text-sm">Đang bật</span></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Huỷ</Button><Button onClick={save}>Lưu</Button></DialogFooter>
          </DialogContent>
          <DialogTrigger className="hidden" />
        </Dialog>
      </CardContent>
    </Card>
  );
}

function LeaderboardTab() {
  const { data: rows = [] } = useLeaderboard();
  return (
    <Card>
      <CardHeader><CardTitle>Bảng xếp hạng toàn tổ chức</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Hạng</TableHead>
              <TableHead>Học viên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Điểm XP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Chưa có dữ liệu</TableCell></TableRow>}
            {rows.map(r => (
              <TableRow key={r.user_id}>
                <TableCell><span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold">{r.rank}</span></TableCell>
                <TableCell className="font-medium">{r.profile?.full_name || "—"}</TableCell>
                <TableCell className="text-muted-foreground">{r.profile?.email}</TableCell>
                <TableCell className="text-right font-mono">{r.xp}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
