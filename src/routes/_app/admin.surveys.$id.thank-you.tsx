import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_app/admin/surveys/$id/thank-you")({
  head: () => ({ meta: [{ title: "Cảm ơn — OnAir TMS" }] }),
  component: () => (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <Card className="max-w-md w-full"><CardContent className="p-10 text-center space-y-4">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto"/>
        <h1 className="text-2xl font-semibold">Cảm ơn bạn!</h1>
        <p className="text-muted-foreground">Phản hồi của bạn đã được ghi nhận.</p>
        <Button asChild><Link to="/dashboard">Về trang chủ</Link></Button>
      </CardContent></Card>
    </div>
  ),
});
