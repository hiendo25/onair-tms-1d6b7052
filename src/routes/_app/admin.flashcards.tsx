import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Layers, Search, Eye, Pencil, Trash2 } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useOrgData } from "@/lib/org-context";

export const Route = createFileRoute("/_app/admin/flashcards")({
  head: () => ({ meta: [{ title: "Flashcard — OnAir LMS" }] }),
  component: FlashcardsPage,
});

function FlashcardsPage() {
  const data = useOrgData();
  return (
    <PageContainer
      title="Flashcard"
      breadcrumbs={[{ title: "Flashcard" }]}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-[300px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Tìm kiếm flashcard..." className="pl-9" />
        </div>
        <Button asChild size="sm">
          <Link to="/admin/flashcards/create"><Plus className="h-4 w-4" />Tạo Flashcard</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {data.flashcards.map(f => (
          <Card key={f.id} className="overflow-hidden p-0 transition-shadow hover:shadow-md">
            <div className="relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
              <Layers className="h-12 w-12 text-indigo-600" />
              <Badge className="absolute right-2 top-2 bg-white/90 text-indigo-700 hover:bg-white/90">{f.cards} thẻ</Badge>
            </div>
            <div className="space-y-2 p-3">
              <h3 className="text-sm font-semibold leading-snug line-clamp-2">{f.title}</h3>
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-[10px]">{f.category}</Badge>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-end gap-1 border-t pt-2">
                <Button size="icon" variant="ghost" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
                <Button asChild size="icon" variant="ghost" className="h-7 w-7">
                  <Link to="/admin/flashcards/$id/edit" params={{ id: f.id }}><Pencil className="h-3.5 w-3.5" /></Link>
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-red-600"><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}

