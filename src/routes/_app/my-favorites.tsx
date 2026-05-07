import { createFileRoute } from "@tanstack/react-router";
import { Heart, BookOpen, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/my-favorites")({
  head: () => ({ meta: [{ title: "Mục yêu thích — OnAir TMS" }] }),
  component: Page,
});

type Favorite = { id: string; item_type: string; item_id: string; title: string };

function Page() {
  const qc = useQueryClient();
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["user_favorites"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return [];
      const { data, error } = await supabase
        .from("user_favorites")
        .select("id, item_type, item_id, title")
        .eq("user_id", u.user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Favorite[];
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_favorites").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["user_favorites"] }); toast.success("Đã xoá khỏi yêu thích"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const typeLabel = (t: string) =>
    t === "lesson" ? "Bài học" : t === "path" ? "Lộ trình" : "Khoá học";

  return (
    <PageContainer title="Mục yêu thích" breadcrumbs={[{ title: "Thư viện" }, { title: "Yêu thích" }]}>
      {isLoading ? (
        <div className="text-sm text-muted-foreground py-8 text-center">Đang tải...</div>
      ) : rows.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <Heart className="h-10 w-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Bạn chưa lưu mục nào</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((f) => (
            <Card key={f.id} className="hover:shadow-md transition">
              <CardContent className="p-5 flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{f.title || "—"}</div>
                  <div className="mt-1">
                    <Badge variant="outline" className="text-[10px]">{typeLabel(f.item_type)}</Badge>
                  </div>
                </div>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-600"
                  onClick={() => remove.mutate(f.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
