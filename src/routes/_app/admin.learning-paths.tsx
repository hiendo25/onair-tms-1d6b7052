import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Search, MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MOCK_LEARNING_PATHS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/admin/learning-paths")({
  head: () => ({ meta: [{ title: "Lộ trình học tập — OnAir LMS" }] }),
  component: LearningPathsPage,
});

function LearningPathsPage() {
  const [search, setSearch] = useState("");

  return (
    <PageContainer
      title="Lộ trình học tập"
      breadcrumbs={[{ title: "Lộ trình học tập" }]}
      actions={
        <Button asChild size="sm">
          <Link to="/admin/learning-paths/create"><Plus className="h-4 w-4" />Tạo lộ trình học tập</Link>
        </Button>
      }
    >
      <Card className="p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm kiếm lộ trình học tập..." className="pl-9" />
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên lộ trình</TableHead>
              <TableHead className="text-center">Số giai đoạn</TableHead>
              <TableHead className="text-center">Số môn học</TableHead>
              <TableHead className="text-center">Học viên</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="w-24 text-center">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_LEARNING_PATHS.filter(lp => !search || lp.title.toLowerCase().includes(search.toLowerCase())).map(lp => (
              <TableRow key={lp.id}>
                <TableCell>
                  <Link to="/admin/learning-paths/$id" params={{ id: lp.id }} className="font-medium hover:underline">
                    {lp.title}
                  </Link>
                  <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{lp.description}</div>
                </TableCell>
                <TableCell className="text-center">{lp.phases.length}</TableCell>
                <TableCell className="text-center">{lp.phases.reduce((s: number, p: { courses: number }) => s + p.courses, 0)}</TableCell>
                <TableCell className="text-center">{lp.enrolled}</TableCell>
                <TableCell className="text-sm text-muted-foreground">2026-01-15</TableCell>
                <TableCell className="text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild><Link to="/admin/learning-paths/$id" params={{ id: lp.id }}><Eye className="h-4 w-4" />Chi tiết</Link></DropdownMenuItem>
                      <DropdownMenuItem asChild><Link to="/admin/learning-paths/edit/$id" params={{ id: lp.id }}><Pencil className="h-4 w-4" />Chỉnh sửa</Link></DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4" />Xóa</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </PageContainer>
  );
}
