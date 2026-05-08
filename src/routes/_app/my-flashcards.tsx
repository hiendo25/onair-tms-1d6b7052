import { createFileRoute } from "@tanstack/react-router";
import { Layers, ImageIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useOrg } from "@/lib/org-context";

export const Route = createFileRoute("/_app/my-flashcards")({
  head: () => ({ meta: [{ title: "Flashcard — OnAir TMS" }] }),
  component: Page,
});

type UFC = {
  id: string; flashcard_id: string;
  content_snapshot: { name?: string; content?: string; image_url?: string };
  delivered_at: string | null; viewed_at: string | null; scheduled_at: string;
};

function Page() {
  const { user } = useAuth();
  const { orgId } = useOrg();
  const [openId, setOpenId] = useState<string | null>(null);

  const { data: rows = [], isLoading, refetch } = useQuery({
    queryKey: ["my-flashcards", user?.id, orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_flashcards")
        .select("*")
        .eq("user_id", user!.id)
        .eq("org_id", orgId)
        .lte("scheduled_at", new Date().toISOString())
        .order("scheduled_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as UFC[];
    },
    enabled: !!user?.id && !!orgId,
  });

  const open = useMemo(() => rows.find(r => r.id === openId), [rows, openId]);

  async function markViewed(r: UFC) {
    setOpenId(r.id);
    if (!r.viewed_at) {
      await supabase.from("user_flashcards").update({ viewed_at: new Date().toISOString() } as never).eq("id", r.id);
      refetch();
    }
  }

  return (
    <PageContainer title="Flashcard của tôi" breadcrumbs={[{ title: "Thư viện" }, { title: "Flashcard" }]}>
      {isLoading ? (
        <div className="text-sm text-muted-foreground py-8 text-center">Đang tải...</div>
      ) : rows.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <Layers className="h-10 w-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Bạn chưa nhận Flashcard nào</p>
          <p className="text-xs mt-1">Flashcard sẽ xuất hiện tại đây sau khi bạn hoàn thành lớp học.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rows.map((f) => {
            const snap = f.content_snapshot || {};
            const isNew = !f.viewed_at;
            return (
              <Card key={f.id} className="cursor-pointer overflow-hidden hover:shadow-md transition" onClick={() => markViewed(f)}>
                <div className="relative aspect-video bg-muted">
                  {snap.image_url ? (
                    <img src={snap.image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-10 w-10 opacity-40" />
                    </div>
                  )}
                  {isNew && <Badge className="absolute top-2 left-2 bg-rose-500">Mới</Badge>}
                </div>
                <CardContent className="p-4 space-y-1">
                  <div className="font-medium line-clamp-1">{snap.name || "Flashcard"}</div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{snap.content || ""}</p>
                  <p className="text-[11px] text-muted-foreground pt-1">
                    {f.delivered_at ? new Date(f.delivered_at).toLocaleDateString("vi-VN") : ""}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!openId} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent className="max-w-md">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle>{open.content_snapshot?.name || "Flashcard"}</DialogTitle>
              </DialogHeader>
              {open.content_snapshot?.image_url && (
                <img src={open.content_snapshot.image_url} alt="" className="rounded border w-full max-h-72 object-contain bg-muted" />
              )}
              <p className="text-sm whitespace-pre-wrap">{open.content_snapshot?.content}</p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
