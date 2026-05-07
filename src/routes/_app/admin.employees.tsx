import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Download, Upload, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MOCK_EMPLOYEES, BRANCHES, DEPARTMENTS, POSITIONS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/admin/employees")({
  head: () => ({ meta: [{ title: "Quản lý người dùng — OnAir LMS" }] }),
  component: EmployeesPage,
});

const ROLE_LABEL = { admin: "Quản trị", teacher: "Giảng viên", student: "Học viên" } as const;

function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [branch, setBranch] = useState("all");
  const [role, setRole] = useState("all");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    return MOCK_EMPLOYEES.filter((e) => {
      if (search && !`${e.name} ${e.email} ${e.code}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (branch !== "all" && e.branch !== branch) return false;
      if (role !== "all" && e.role !== role) return false;
      return true;
    });
  }, [search, branch, role]);

  return (
    <PageContainer
      title="Danh sách người dùng"
      breadcrumbs={[{ title: "Quản lý tổ chức" }, { title: "Người dùng" }]}
      actions={
        <>
          <Button variant="outline" size="sm"><Upload className="h-4 w-4" />Import</Button>
          <Button variant="outline" size="sm"><Download className="h-4 w-4" />Export</Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4" />Thêm người dùng</Button>
            </DialogTrigger>
            <CreateEmployeeDialog onClose={() => setOpen(false)} />
          </Dialog>
        </>
      }
    >
      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tên, email, mã NV..." className="pl-9" />
          </div>
          <Select value={branch} onValueChange={setBranch}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Chi nhánh" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả chi nhánh</SelectItem>
              {BRANCHES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Vai trò" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              <SelectItem value="admin">Quản trị</SelectItem>
              <SelectItem value="teacher">Giảng viên</SelectItem>
              <SelectItem value="student">Học viên</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Người dùng</TableHead>
              <TableHead>Mã NV</TableHead>
              <TableHead>Chi nhánh</TableHead>
              <TableHead>Phòng ban</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((e, i) => (
              <TableRow key={e.id}>
                <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{e.name.split(" ").slice(-2).map(n => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{e.name}</div>
                      <div className="text-xs text-muted-foreground">{e.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs">{e.code}</TableCell>
                <TableCell>{e.branch}</TableCell>
                <TableCell>{e.department}</TableCell>
                <TableCell>
                  <Badge variant={e.role === "admin" ? "default" : e.role === "teacher" ? "secondary" : "outline"}>
                    {ROLE_LABEL[e.role]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center gap-1.5 text-xs ${e.status === "active" ? "text-emerald-600" : "text-muted-foreground"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${e.status === "active" ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                    {e.status === "active" ? "Đang hoạt động" : "Ngưng hoạt động"}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Pencil className="h-4 w-4" />Chỉnh sửa</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4" />Xoá</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={8} className="h-32 text-center text-muted-foreground">Không có người dùng nào</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
          <span>Hiển thị {filtered.length} / {MOCK_EMPLOYEES.length} người dùng</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled>Trước</Button>
            <Button variant="outline" size="sm" disabled>Sau</Button>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}

function CreateEmployeeDialog({ onClose }: { onClose: () => void }) {
  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Thêm người dùng</DialogTitle>
        <DialogDescription>Nhập thông tin người dùng mới vào hệ thống.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-2">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Họ và tên *</Label><Input placeholder="Nguyễn Văn A" /></div>
          <div className="space-y-1.5"><Label>Mã nhân viên *</Label><Input placeholder="NV011" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Email *</Label><Input type="email" placeholder="email@onair.com" /></div>
          <div className="space-y-1.5"><Label>Số điện thoại</Label><Input placeholder="09xx xxx xxx" /></div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label>Chi nhánh</Label>
            <Select><SelectTrigger><SelectValue placeholder="Chọn..." /></SelectTrigger>
              <SelectContent>{BRANCHES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="space-y-1.5">
            <Label>Phòng ban</Label>
            <Select><SelectTrigger><SelectValue placeholder="Chọn..." /></SelectTrigger>
              <SelectContent>{DEPARTMENTS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="space-y-1.5">
            <Label>Chức vụ</Label>
            <Select><SelectTrigger><SelectValue placeholder="Chọn..." /></SelectTrigger>
              <SelectContent>{POSITIONS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Vai trò</Label>
          <Select defaultValue="student"><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Quản trị</SelectItem>
              <SelectItem value="teacher">Giảng viên</SelectItem>
              <SelectItem value="student">Học viên</SelectItem>
            </SelectContent></Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Huỷ</Button>
        <Button onClick={onClose}>Thêm người dùng</Button>
      </DialogFooter>
    </DialogContent>
  );
}
