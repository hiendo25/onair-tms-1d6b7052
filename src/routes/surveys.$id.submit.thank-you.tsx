import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/surveys/$id/submit/thank-you")({
  head: () => ({ meta: [{ title: "Cảm ơn — OnAir TMS" }] }),
  component: () => (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md p-8 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
        <h1 className="mt-4 text-2xl font-semibold">Cảm ơn bạn đã hoàn thành khảo sát!</h1>
        <p className="mt-2 text-sm text-muted-foreground">Phản hồi của bạn đã được ghi nhận.</p>
        <Button asChild className="mt-6"><Link to="/dashboard">Về trang chủ</Link></Button>
      </Card>
    </div>
  ),
});
