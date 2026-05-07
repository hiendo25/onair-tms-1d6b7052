import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/auth/signin")({
  head: () => ({ meta: [{ title: "Đăng nhập — OnAir LMS" }] }),
  component: () => (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted px-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h1 className="mt-3 text-2xl font-semibold">Đăng nhập OnAir LMS</h1>
          <p className="mt-1 text-sm text-muted-foreground">Nhập thông tin để tiếp tục</p>
        </div>
        <form className="space-y-4">
          <div className="space-y-1.5"><Label>Email</Label><Input type="email" placeholder="email@onair.com" /></div>
          <div className="space-y-1.5">
            <div className="flex justify-between"><Label>Mật khẩu</Label><a className="text-xs text-primary hover:underline" href="#">Quên mật khẩu?</a></div>
            <Input type="password" placeholder="••••••••" />
          </div>
          <Button asChild className="w-full"><Link to="/dashboard">Đăng nhập</Link></Button>
        </form>
        <div className="my-4 flex items-center gap-2 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" />HOẶC<div className="h-px flex-1 bg-border" /></div>
        <Button variant="outline" className="w-full">Đăng nhập với Google</Button>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Chưa có tài khoản? <Link to="/auth/signup" className="text-primary hover:underline">Đăng ký</Link>
        </p>
      </Card>
    </div>
  ),
});
