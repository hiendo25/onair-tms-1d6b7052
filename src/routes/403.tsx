import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldOff } from "lucide-react";

export const Route = createFileRoute("/403")({
  head: () => ({ meta: [{ title: "403 — OnAir LMS" }] }),
  component: () => (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-md w-full"><CardContent className="p-10 text-center space-y-4">
        <ShieldOff className="h-14 w-14 text-destructive mx-auto"/>
        <h1 className="text-2xl font-semibold">403 — Truy cập bị từ chối</h1>
        <p className="text-sm text-muted-foreground">Bạn không có quyền xem trang này.</p>
        <Button asChild><Link to="/dashboard">Về trang chủ</Link></Button>
      </CardContent></Card>
    </div>
  ),
});
