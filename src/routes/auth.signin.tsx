import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/auth/signin")({
  head: () => ({ meta: [{ title: "Đăng nhập tài khoản | ONAIR" }] }),
  component: () => (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted px-4">
      <Card className="w-full max-w-[450px] p-8">
        <div className="mb-6">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-semibold">Đăng nhập</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Truy cập vào OnAir TMS để bắt đầu hành trình học tập và phát triển của bạn
          </p>
        </div>
        <form className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm">Email</Label>
            <Input id="email" type="email" placeholder="your@email.com" autoComplete="email" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm">Mật khẩu</Label>
            <Input id="password" type="password" placeholder="Mật khẩu của bạn" autoComplete="current-password" />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox /> Ghi nhớ đăng nhập
            </label>
            <a href="#" className="text-sm font-semibold text-primary">Quên mật khẩu?</a>
          </div>
          <Button asChild className="w-full" size="lg"><Link to="/dashboard">Đăng nhập</Link></Button>
        </form>
        <div className="my-4 text-center text-sm font-bold">Hoặc</div>
        <Button variant="outline" className="w-full" size="lg">Đăng nhập với Google</Button>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Chưa có tài khoản? <Link to="/auth/signup" className="font-semibold text-primary">Đăng ký</Link>
        </p>
      </Card>
    </div>
  ),
});
