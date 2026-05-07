import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export const Route = createFileRoute("/no-organization")({
  head: () => ({ meta: [{ title: "Chưa có tổ chức — OnAir TMS" }] }),
  component: () => (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-md w-full"><CardContent className="p-10 text-center space-y-4">
        <AlertCircle className="h-14 w-14 text-warning mx-auto"/>
        <h1 className="text-xl font-semibold">Bạn chưa thuộc tổ chức nào</h1>
        <p className="text-sm text-muted-foreground">Vui lòng liên hệ quản trị viên.</p>
        <Button asChild><Link to="/auth/signin">Đăng nhập lại</Link></Button>
      </CardContent></Card>
    </div>
  ),
});
