import { createFileRoute } from "@tanstack/react-router";
import { Heart, BookOpen } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MOCK = [
  { id: "1", title: "Khoá Barista Level 1", type: "Khoá học", lessons: 12 },
  { id: "2", title: "Bài học: Pha chế Espresso", type: "Bài học", lessons: 1 },
  { id: "3", title: "Lộ trình quản lý cửa hàng", type: "Lộ trình", lessons: 8 },
  { id: "4", title: "Khoá Văn hoá Highlands", type: "Khoá học", lessons: 5 },
];

export const Route = createFileRoute("/_app/my-favorites")({
  head: () => ({ meta: [{ title: "Mục yêu thích — OnAir TMS" }] }),
  component: () => (
    <PageContainer title="Mục yêu thích" breadcrumbs={[{ title: "Thư viện" }, { title: "Yêu thích" }]}>
      {MOCK.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <Heart className="h-10 w-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Bạn chưa lưu mục nào</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK.map((f) => (
            <Card key={f.id} className="hover:shadow-md transition">
              <CardContent className="p-5 flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{f.title}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{f.type}</Badge>
                    <span className="text-xs text-muted-foreground">{f.lessons} bài</span>
                  </div>
                </div>
                <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  ),
});
