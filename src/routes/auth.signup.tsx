import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({ meta: [{ title: "Đăng ký tài khoản doanh nghiệp | ONAIR" }] }),
  component: () => (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted px-4 py-8">
      <Card className="w-full max-w-[450px] p-8">
        <div className="mb-6">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-semibold">Đăng ký tài khoản doanh nghiệp</h1>
          <p className="mt-1 text-sm text-muted-foreground">Bắt đầu hành trình đào tạo cho tổ chức của bạn</p>
        </div>
        <form className="space-y-4">
          <div className="space-y-1.5"><Label className="text-sm">Tên tổ chức</Label><Input placeholder="OnAir Corp" /></div>
          <div className="space-y-1.5"><Label className="text-sm">Họ và tên</Label><Input placeholder="Nguyễn Văn A" /></div>
          <div className="space-y-1.5"><Label className="text-sm">Email công việc</Label><Input type="email" placeholder="your@email.com" /></div>
          <div className="space-y-1.5"><Label className="text-sm">Mật khẩu</Label><Input type="password" placeholder="Ít nhất 8 ký tự" /></div>
          <div className="space-y-1.5"><Label className="text-sm">Xác nhận mật khẩu</Label><Input type="password" /></div>
          <Button asChild className="w-full" size="lg"><Link to="/dashboard">Tạo tài khoản</Link></Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Đã có tài khoản? <Link to="/auth/signin" className="font-semibold text-primary">Đăng nhập</Link>
        </p>
      </Card>
    </div>
  ),
});
