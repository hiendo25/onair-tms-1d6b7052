import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Search, MoreVertical } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MOCK_COURSES } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/admin/online-course")({
  head: () => ({ meta: [{ title: "Môn học — OnAir LMS" }] }),
  component: CoursesPage,
});

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  published: { label: "Đã xuất bản", color: "bg-emerald-500" },
  draft: { label: "Bản nháp", color: "bg-amber-500" },
  pending: { label: "Chờ duyệt", color: "bg-blue-500" },
  unpublished: { label: "Đã hủy xuất bản", color: "bg-slate-500" },
};

function CoursesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => MOCK_COURSES.filter(c =>
    (!search || c.title.toLowerCase().includes(search.toLowerCase()))
  ), [search]);

  return (
    <PageContainer
      title="Danh sách môn học"
      breadcrumbs={[{ title: "Quản lý lớp học" }, { title: "Môn học" }]}
      actions={
        <Button asChild size="sm">
          <Link to="/admin/online-course/create"><Plus className="h-4 w-4" />Tạo môn học</Link>
        </Button>
      }
    >
      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm môn học..." className="pl-9" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="published">Đã xuất bản</SelectItem>
              <SelectItem value="draft">Bản nháp</SelectItem>
              <SelectItem value="pending">Chờ duyệt</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 text-center">STT</TableHead>
              <TableHead>Tên môn học</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-20 text-center">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c, i) => {
              const s = STATUS_LABEL.published;
              return (
                <TableRow key={c.id}>
                  <TableCell className="text-center text-muted-foreground">{i + 1}</TableCell>
                  <TableCell>
                    <Link to="/admin/online-course/$id" params={{ id: c.id }} className="font-medium hover:underline">
                      {c.title}
                    </Link>
                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{c.description}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={s.color}>{s.label}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild><Link to="/admin/online-course/$id/edit" params={{ id: c.id }}>Chỉnh sửa</Link></DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Xóa</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </PageContainer>
  );
}
