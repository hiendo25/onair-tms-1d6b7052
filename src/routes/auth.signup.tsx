import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { GraduationCap, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({ meta: [{ title: "Đăng ký | OnAir TMS" }] }),
  component: SignUpPage,
});

const schema = z
  .object({
    fullName: z.string().trim().min(2, "Vui lòng nhập họ tên").max(100),
    email: z.string().trim().email("Email không hợp lệ").max(255),
    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự").max(100),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirm"],
  });

function SignUpPage() {
  const navigate = useNavigate();
  const { user, isReady } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isReady && user) navigate({ to: "/dashboard" });
  }, [isReady, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const parsed = schema.safeParse({ fullName, email, password, confirm });
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: parsed.data.fullName },
      },
    });
    setLoading(false);
    if (err) {
      setError(
        err.message.includes("already registered")
          ? "Email đã được đăng ký"
          : err.message,
      );
      return;
    }
    toast.success("Tạo tài khoản thành công");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted px-4 py-8">
      <Card className="w-full max-w-[450px] p-8">
        <div className="mb-6">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-semibold">Đăng ký tài khoản</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Bắt đầu hành trình đào tạo cho tổ chức của bạn
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label className="text-sm">Họ và tên</Label>
            <Input
              placeholder="Nguyễn Văn A"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Email công việc</Label>
            <Input
              type="email"
              placeholder="your@email.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Mật khẩu</Label>
            <Input
              type="password"
              placeholder="Ít nhất 6 ký tự"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Xác nhận mật khẩu</Label>
            <Input
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Tạo tài khoản
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Đã có tài khoản?{" "}
          <Link to="/auth/signin" className="font-semibold text-primary">
            Đăng nhập
          </Link>
        </p>
      </Card>
    </div>
  );
}
