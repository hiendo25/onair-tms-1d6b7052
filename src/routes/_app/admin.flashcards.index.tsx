import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Eye, ImageIcon, Power, Search } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useFlashcards, useFlashcardMutations } from "@/lib/data-hooks";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useOrg } from "@/lib/org-context";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/admin/flashcards/")({
  head: () => ({ meta: [{ title: "Flashcard — OnAir TMS" }] }),
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const { orgId } = useOrg();
  const { data: rows = [], isLoading } = useFlashcards();
  const m = useFlashcardMutations();
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState<{ id: string; name: string; usage: number; sent: number } | null>(null);

  // Usage counts (classroom + sent) for all flashcards
  const { data: usage = {} } = useQuery({
    queryKey: ["flashcard-usage", orgId],
    queryFn: async () => {
      const [{ data: cfc }, { data: ufc }] = await Promise.all([
        supabase.from("classroom_flashcards").select("flashcard_id").eq("org_id", orgId),
        supabase.from("user_flashcards").select("flashcard_id").eq("org_id", orgId),
      ]);
      const map: Record<string, { classes: number; sent: number }> = {};
      (cfc ?? []).forEach((r: { flashcard_id: string }) => {
        map[r.flashcard_id] = map[r.flashcard_id] ?? { classes: 0, sent: 0 };
        map[r.flashcard_id].classes++;
      });
      (ufc ?? []).forEach((r: { flashcard_id: string }) => {
        map[r.flashcard_id] = map[r.flashcard_id] ?? { classes: 0, sent: 0 };
        map[r.flashcard_id].sent++;
      });
      return map;
    },
    enabled: !!orgId,
  });

  const filtered = useMemo(() => {
    const k = search.trim().toLowerCase();
    if (!k) return rows;
    return rows.filter(r => (r.name || r.title || "").toLowerCase().includes(k) || (r.content || "").toLowerCase().includes(k));
  }, [rows, search]);

  async function toggleEnabled(id: string, enabled: boolean) {
    await m.update.mutateAsync({ id, enabled } as never);
  }

  function openPreview(row: typeof rows[number]) {
    setPreview(row.id);
  }
  const previewRow = preview ? rows.find(r => r.id === preview) : null;

  function tryDelete(row: typeof rows[number]) {
    const u = usage[row.id] ?? { classes: 0, sent: 0 };
    if (u.classes > 0 || u.sent > 0) {
      toast.error("Không thể xoá Flashcard này", {
        description: "Flashcard đã được gán hoặc đã gửi cho học viên. Hãy tắt Flashcard thay vì xoá để giữ toàn vẹn dữ liệu.",
      });
      return;
    }
    setConfirmDel({ id: row.id, name: row.name || row.title || "", usage: u.classes, sent: u.sent });
  }

  return (
    <PageContainer
      title="Flashcard"
      breadcrumbs={[{ title: "Thi đua & xếp hạng" }, { title: "Flashcard" }]}
      actions={
        <Button size="sm" onClick={() => navigate({ to: "/admin/flashcards/$id/edit", params: { id: "new" } })}>
          <Plus className="h-4 w-4" /> Tạo Flashcard
        </Button>
      }
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Tìm Flashcard..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-sm text-muted-foreground">Đang tải...</div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Chưa có Flashcard</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((f) => {
            const u = usage[f.id] ?? { classes: 0, sent: 0 };
            const enabled = f.enabled !== false;
            return (
              <Card key={f.id} className={cn("group overflow-hidden transition hover:shadow-md", !enabled && "opacity-60")}>
                <div className="relative aspect-video bg-muted">
                  {f.image_url ? (
                    <img src={f.image_url} alt={f.name || f.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-10 w-10 opacity-40" />
                    </div>
                  )}
                  <div className="absolute right-2 top-2">
                    <Switch checked={enabled} onCheckedChange={(v) => toggleEnabled(f.id, v)} />
                  </div>
                </div>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-medium line-clamp-1">{f.name || f.title}</div>
                    <Badge variant={enabled ? "default" : "secondary"} className="shrink-0">
                      <Power className="h-3 w-3 mr-1" />
                      {enabled ? "Bật" : "Tắt"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">{f.content || "—"}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{u.classes} lớp · {u.sent} đã gửi</span>
                  </div>
                  <div className="flex items-center gap-1 pt-1">
                    <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => openPreview(f)}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 px-2" asChild>
                      <Link to="/admin/flashcards/$id/edit" params={{ id: f.id }}><Pencil className="h-3.5 w-3.5" /></Link>
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 px-2 text-rose-600 hover:text-rose-700" onClick={() => tryDelete(f)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-lg">
          {previewRow && (
            <>
              <DialogHeader>
                <DialogTitle>{previewRow.name || previewRow.title}</DialogTitle>
                <DialogDescription>
                  {(usage[previewRow.id]?.classes ?? 0)} lớp đang gán · {(usage[previewRow.id]?.sent ?? 0)} học viên đã nhận
                </DialogDescription>
              </DialogHeader>
              {previewRow.image_url && (
                <img src={previewRow.image_url} alt="" className="rounded border w-full max-h-72 object-contain bg-muted" />
              )}
              <p className="text-sm whitespace-pre-wrap">{previewRow.content}</p>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xoá Flashcard?</DialogTitle>
            <DialogDescription>Flashcard này chưa từng được sử dụng. Bạn có chắc chắn muốn xoá vĩnh viễn?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDel(null)}>Huỷ</Button>
            <Button variant="destructive" onClick={async () => {
              if (!confirmDel) return;
              await m.remove.mutateAsync(confirmDel.id);
              setConfirmDel(null);
            }}>Xoá</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
