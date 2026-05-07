import { createFileRoute } from "@tanstack/react-router";
import { Award, Layers, Heart, FileText, Search } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MOCK_FLASHCARDS, MOCK_CERTIFICATES } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/library")({
  head: () => ({ meta: [{ title: "Thư viện — OnAir LMS" }] }),
  component: () => (
    <PageContainer
      title="Thư viện"
      description="Tài liệu, flashcard và chứng nhận của bạn"
      breadcrumbs={[{ title: "Học tập" }, { title: "Thư viện" }]}
    >
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Tìm trong thư viện..." className="pl-9 bg-background" />
      </div>

      <Tabs defaultValue="cert">
        <TabsList>
          <TabsTrigger value="cert"><Award className="h-4 w-4" />Chứng nhận</TabsTrigger>
          <TabsTrigger value="flash"><Layers className="h-4 w-4" />Flashcard</TabsTrigger>
          <TabsTrigger value="docs"><FileText className="h-4 w-4" />Tài liệu</TabsTrigger>
          <TabsTrigger value="fav"><Heart className="h-4 w-4" />Yêu thích</TabsTrigger>
        </TabsList>

        <TabsContent value="cert">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {MOCK_CERTIFICATES.map(c => (
              <Card key={c.id} className="overflow-hidden p-0">
                <div className="relative flex h-32 items-center justify-center bg-gradient-to-br from-amber-50 to-amber-200">
                  <Award className="h-12 w-12 text-amber-600" />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold leading-snug">{c.name}</h3>
                  <div className="mt-2 text-xs text-muted-foreground">Cấp ngày {c.createdAt}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="flash">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {MOCK_FLASHCARDS.map(f => (
              <Card key={f.id} className="overflow-hidden">
                <div className="relative bg-gradient-to-br from-indigo-100 to-purple-100 p-6">
                  <Layers className="h-10 w-10 text-indigo-600" />
                </div>
                <CardContent className="space-y-2 p-4">
                  <h3 className="font-semibold leading-snug line-clamp-2">{f.title}</h3>
                  <div className="flex items-center justify-between text-xs">
                    <Badge variant="secondary">{f.category}</Badge>
                    <span className="text-muted-foreground">{f.cards} thẻ</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="docs">
          <Card className="p-8 text-center text-sm text-muted-foreground">Chưa có tài liệu nào.</Card>
        </TabsContent>
        <TabsContent value="fav">
          <Card className="p-8 text-center text-sm text-muted-foreground">Bạn chưa đánh dấu mục yêu thích.</Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  ),
});
