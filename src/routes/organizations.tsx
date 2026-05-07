import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

export const Route = createFileRoute("/organizations")({
  head: () => ({ meta: [{ title: "Chọn tổ chức — OnAir TMS" }] }),
  component: () => (
    <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
      <div className="max-w-2xl w-full">
        <h1 className="text-2xl font-semibold text-center mb-6">Chọn tổ chức của bạn</h1>
        <div className="grid gap-3 md:grid-cols-2">
          {["OnAir Tech","ABC Corp","XYZ Group"].map((n)=>(
            <Card key={n} className="hover:shadow-elevated transition cursor-pointer"><CardContent className="p-5 flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-gradient-vibrant flex items-center justify-center text-white"><Building2 className="h-6 w-6"/></div>
              <div className="flex-1"><div className="font-medium">{n}</div><div className="text-xs text-muted-foreground">Admin</div></div>
              <Button size="sm" asChild><Link to="/dashboard">Vào</Link></Button>
            </CardContent></Card>
          ))}
        </div>
      </div>
    </div>
  ),
});
