import { createFileRoute } from "@tanstack/react-router";
import { Search, MoreVertical } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ROWS = [
  { id: "1", name: "Kiểm tra nghiệp vụ pha chế Q1/2025", description: "Đánh giá kỹ năng pha chế chuẩn Highlands", submitted_at: "12/03/2025 14:23", status: "graded", result: "pass", score: 92, max: 100 },
  { id: "2", name: "Bài test VSATTP tháng 5/2025", description: "Bài kiểm tra định kỳ về vệ sinh an toàn thực phẩm", submitted_at: "-", status: "in_progress", result: "none", score: null, max: 100 },
  { id: "3", name: "Tình huống xử lý khiếu nại khách hàng", description: "Bài tự luận xử lý phàn nàn về đồ uống", submitted_at: "-", status: "in_progress", result: "none", score: null, max: 100 },
  { id: "4", name: "Kiểm tra vận hành máy POS", description: "Bài kiểm tra thao tác trên POS Highlands", submitted_at: "15/04/2025 09:10", status: "graded", result: "pass", score: 85, max: 100 },
  { id: "5", name: "Đánh giá kỹ năng phục vụ khách hàng", description: "Bài đánh giá tổng hợp dịch vụ khách hàng", submitted_at: "02/04/2025 16:42", status: "graded", result: "fail", score: 48, max: 100 },
];

const statusChip: Record<string, { label: string; cls: string }> = {
  in_progress: { label: "Chưa nộp", cls: "bg-amber-100 text-amber-700" },
  submitted: { label: "Đã nộp", cls: "bg-blue-100 text-blue-700" },
  graded: { label: "Đã chấm", cls: "bg-emerald-100 text-emerald-700" },
};

const resultChip: Record<string, { label: string; cls: string }> = {
  pass: { label: "Đạt", cls: "bg-emerald-100 text-emerald-700" },
  fail: { label: "Không đạt", cls: "bg-amber-100 text-amber-700" },
  late: { label: "Nộp trễ", cls: "bg-red-100 text-red-700" },
};

export const Route = createFileRoute("/_app/my-assignments")({
  head: () => ({ meta: [{ title: "Bài kiểm tra của tôi — OnAir LMS" }] }),
  component: () => (
    <PageContainer
      title="Bài kiểm tra của tôi"
      breadcrumbs={[{ title: "Bài kiểm tra của tôi" }]}
    >
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Danh sách bài kiểm tra được giao</h2>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="relative w-full max-w-[300px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Tìm kiếm bài kiểm tra..." className="pl-9" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="in_progress">Chưa nộp</SelectItem>
              <SelectItem value="submitted">Đã nộp</SelectItem>
              <SelectItem value="graded">Đã chấm</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên bài kiểm tra</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Ngày nộp</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Kết quả</TableHead>
              <TableHead>Điểm</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ROWS.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell className="max-w-[280px] truncate text-sm text-muted-foreground">{r.description}</TableCell>
                <TableCell className="text-sm">{r.submitted_at}</TableCell>
                <TableCell><Badge className={`${statusChip[r.status].cls} hover:${statusChip[r.status].cls}`}>{statusChip[r.status].label}</Badge></TableCell>
                <TableCell>
                  {r.result === "none" ? <span className="text-sm text-muted-foreground">-</span> :
                    <Badge className={`${resultChip[r.result].cls} hover:${resultChip[r.result].cls}`}>{resultChip[r.result].label}</Badge>}
                </TableCell>
                <TableCell className="text-sm font-medium">
                  {r.status === "graded" && r.score !== null ? `${r.score}/${r.max}` : <span className="text-muted-foreground">-</span>}
                </TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </PageContainer>
  ),
});
