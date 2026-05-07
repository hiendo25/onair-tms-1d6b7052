import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/auth/AuthLayout";
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
  const [showPwd, setShowPwd] = useState(false);
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
    <AuthLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-900">Đăng ký tài khoản</h1>
        <p className="mt-2 text-sm text-slate-500">
          Bắt đầu hành trình đào tạo cho tổ chức của bạn
        </p>
      </div>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-700">Họ và tên</Label>
          <Input
            placeholder="Nguyễn Văn A"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="h-11"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-700">Email công việc</Label>
          <Input
            type="email"
            placeholder="your@email.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-700">Mật khẩu</Label>
          <div className="relative">
            <Input
              type={showPwd ? "text" : "password"}
              placeholder="Ít nhất 6 ký tự"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              tabIndex={-1}
              aria-label={showPwd ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-700">Xác nhận mật khẩu</Label>
          <Input
            type={showPwd ? "text" : "password"}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="h-11"
          />
        </div>
        {error && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}
        <Button
          type="submit"
          className="h-11 w-full rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          disabled={loading}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Tạo tài khoản
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Đã có tài khoản?{" "}
        <Link to="/auth/signin" className="font-semibold text-blue-600 hover:underline">
          Đăng nhập
        </Link>
      </p>
    </AuthLayout>
  );
}
