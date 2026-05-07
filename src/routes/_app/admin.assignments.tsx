import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Search, MoreVertical, FileText, Clock, HelpCircle, Star, UserPlus } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MOCK_ASSIGNMENTS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/admin/assignments")({
  head: () => ({ meta: [{ title: "Bài kiểm tra — OnAir LMS" }] }),
  component: AssignmentsPage,
});

function AssignmentsPage() {
  const [tab, setTab] = useState("list");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  return (
    <PageContainer
      title="Quản lý bài kiểm tra"
      breadcrumbs={[{ title: "Bài kiểm tra" }]}
      actions={
        <>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/assignments/question-bank"><FileText className="h-4 w-4" />Ngân hàng câu hỏi</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/admin/assignments/create"><Plus className="h-4 w-4" />Tạo bài kiểm tra</Link>
          </Button>
        </>
      }
    >
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="list">Ngân hàng bài kiểm tra</TabsTrigger>
          <TabsTrigger value="assigned">Đã gán</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm bài kiểm tra..." className="pl-9" />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-44"><SelectValue placeholder="Danh mục" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  <SelectItem value="quiz">Trắc nghiệm</SelectItem>
                  <SelectItem value="essay">Tự luận</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {MOCK_ASSIGNMENTS.map((a) => (
              <Card key={a.id} className="overflow-hidden p-0">
                <div className="bg-blue-50 h-32 flex items-center justify-center relative">
                  <FileText className="h-12 w-12 text-primary" />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-8 w-8 bg-white/80">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild><Link to="/admin/assignments/$id" params={{ id: a.id }}>Xem chi tiết</Link></DropdownMenuItem>
                      <DropdownMenuItem asChild><Link to="/admin/assignments/$id/assign" params={{ id: a.id }}>Gán nhân viên</Link></DropdownMenuItem>
                      <DropdownMenuItem asChild><Link to="/admin/assignments/edit/$id" params={{ id: a.id }}>Chỉnh sửa</Link></DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Xóa</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="p-4 space-y-3">
                  <h3 className="font-semibold leading-snug line-clamp-2 min-h-[2.5em]">{a.title}</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><HelpCircle className="h-3.5 w-3.5" />{a.questions} câu</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{a.duration} phút</span>
                    <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5" />Đạt {Math.round(a.questions * 0.6)}đ</span>
                    <span className="flex items-center gap-1"><UserPlus className="h-3.5 w-3.5" />Đã gán</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assigned">
          <Card className="p-8 text-center text-sm text-muted-foreground">
            Danh sách bài kiểm tra đã được gán cho lớp học sẽ hiển thị tại đây.
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
