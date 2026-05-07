import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, MoreHorizontal, Clock, FileText } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MOCK_ASSIGNMENTS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/admin/assignments")({
  head: () => ({ meta: [{ title: "Bài kiểm tra — OnAir LMS" }] }),
  component: AssignmentsPage,
});

const TYPE_VARIANT = { "Trắc nghiệm": "default", "Tự luận": "secondary", "Hỗn hợp": "outline" } as const;

function AssignmentsPage() {
  const [tab, setTab] = useState("list");
  return (
    <PageContainer
      title="Quản lý bài kiểm tra"
      breadcrumbs={[{ title: "Bài kiểm tra" }]}
      actions={<Button size="sm"><Plus className="h-4 w-4" />Tạo bài kiểm tra</Button>}
    >
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="list">Ngân hàng bài kiểm tra</TabsTrigger>
          <TabsTrigger value="assigned">Đã gán</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên bài kiểm tra</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead className="text-right">Số câu</TableHead>
                  <TableHead className="text-right">Thời lượng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_ASSIGNMENTS.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.title}</TableCell>
                    <TableCell><Badge variant={TYPE_VARIANT[a.type]}>{a.type}</Badge></TableCell>
                    <TableCell className="text-right">{a.questions}</TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center gap-1 text-sm">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />{a.duration} phút
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={a.status === "published" ? "default" : "outline"}>
                        {a.status === "published" ? "Đã xuất bản" : "Nháp"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{a.createdAt}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
                          <DropdownMenuItem>Nhân bản</DropdownMenuItem>
                          <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Xoá</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          <div className="mt-3">
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/assignments/question-bank"><FileText className="h-4 w-4" />Mở ngân hàng câu hỏi</Link>
            </Button>
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
