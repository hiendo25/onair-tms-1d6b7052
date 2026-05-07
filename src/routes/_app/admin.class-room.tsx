import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Search, MoreVertical } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MOCK_CLASSROOMS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/admin/class-room")({
  head: () => ({ meta: [{ title: "Quản lý lớp học — OnAir LMS" }] }),
  component: ClassRoomPage,
});

const RUNTIME_LABEL: Record<string, string> = {
  active: "Đang diễn ra",
  draft: "Nháp",
  completed: "Đã diễn ra",
};

const RUNTIME_COLOR: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  draft: "bg-amber-100 text-amber-700",
  completed: "bg-slate-100 text-slate-700",
};

function ClassRoomPage() {
  const [search, setSearch] = useState("");
  const [runtime, setRuntime] = useState("all");
  const [type, setType] = useState("all");

  const filtered = useMemo(() => {
    return MOCK_CLASSROOMS.filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (runtime !== "all" && c.status !== runtime) return false;
      if (type !== "all" && c.type !== type) return false;
      return true;
    });
  }, [search, runtime, type]);

  return (
    <PageContainer
      title="Danh sách lớp học"
      breadcrumbs={[{ title: "Quản lý lớp học" }, { title: "Danh sách" }]}
      actions={
        <Button asChild size="sm">
          <Link to="/admin/class-room/create"><Plus className="h-4 w-4" />Tạo lớp học</Link>
        </Button>
      }
    >
      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm lớp học..." className="pl-9" />
          </div>
          <Select value={runtime} onValueChange={setRuntime}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Đang diễn ra</SelectItem>
              <SelectItem value="draft">Nháp</SelectItem>
              <SelectItem value="completed">Đã diễn ra</SelectItem>
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Loại lớp" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
              <SelectItem value="hybrid">Live</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 text-center">STT</TableHead>
              <TableHead>Tên lớp học</TableHead>
              <TableHead className="text-center">Loại lớp học</TableHead>
              <TableHead className="text-center">Học viên</TableHead>
              <TableHead className="text-center">Trạng thái diễn ra</TableHead>
              <TableHead className="text-center">Thời gian</TableHead>
              <TableHead className="w-20 text-center">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c, i) => (
              <TableRow key={c.id}>
                <TableCell className="text-center text-muted-foreground">{String(i + 1).padStart(2, "0")}</TableCell>
                <TableCell>
                  <Link to="/admin/class-room/$id/students" params={{ id: c.id }} className="font-medium hover:underline">
                    {c.name}
                  </Link>
                  <div className="text-xs text-muted-foreground font-mono mt-0.5">{c.code}</div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline">{c.type === "online" ? "Online" : c.type === "offline" ? "Offline" : "Live"}</Badge>
                </TableCell>
                <TableCell className="text-center">{c.students}/{c.capacity}</TableCell>
                <TableCell className="text-center">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${RUNTIME_COLOR[c.status]}`}>
                    {RUNTIME_LABEL[c.status]}
                  </span>
                </TableCell>
                <TableCell className="text-center text-xs text-muted-foreground">{c.startDate} → {c.endDate}</TableCell>
                <TableCell className="text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to="/admin/class-room/$id/students" params={{ id: c.id }}>Xem chi tiết</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/class-room/$id/edit" params={{ id: c.id }}>Chỉnh sửa</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Xoá</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={7} className="h-32 text-center text-muted-foreground">Không có lớp học nào</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </PageContainer>
  );
}
