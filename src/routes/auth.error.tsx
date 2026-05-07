import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export const Route = createFileRoute("/auth/error")({
  head: () => ({ meta: [{ title: "Lỗi — OnAir TMS" }] }),
  component: () => (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-md w-full"><CardContent className="p-10 text-center space-y-4">
        <XCircle className="h-14 w-14 text-destructive mx-auto"/>
        <h1 className="text-xl font-semibold">Đăng nhập thất bại</h1>
        <p className="text-sm text-muted-foreground">Vui lòng thử lại.</p>
        <Button asChild><Link to="/auth/signin">Quay lại</Link></Button>
      </CardContent></Card>
    </div>
  ),
});
