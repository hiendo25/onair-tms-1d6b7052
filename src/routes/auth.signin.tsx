import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/signin")({
  head: () => ({ meta: [{ title: "Đăng nhập | OnAir TMS" }] }),
  component: SignInPage,
});

const schema = z.object({
  email: z.string().trim().email("Email không hợp lệ").max(255),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự").max(100),
});

function SignInPage() {
  const navigate = useNavigate();
  const { user, isReady } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isReady && user) navigate({ to: "/dashboard" });
  }, [isReady, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (err) {
      setError(
        err.message.includes("Invalid login credentials")
          ? "Email hoặc mật khẩu không đúng"
          : err.message,
      );
      return;
    }
    toast.success("Đăng nhập thành công");
    navigate({ to: "/dashboard" });
  };

  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-900">Đăng nhập</h1>
        <p className="mt-2 text-sm text-slate-500">
          Truy cập vào OnAir TMS để bắt đầu hành trình học tập
        </p>
      </div>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email
          </Label>
          <Input
            id="email"
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
          <Label htmlFor="password" className="text-sm font-medium text-slate-700">
            Mật khẩu
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPwd ? "text" : "password"}
              placeholder="Mật khẩu của bạn"
              autoComplete="current-password"
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
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <Checkbox
              checked={remember}
              onCheckedChange={(v) => setRemember(!!v)}
            />
            Ghi nhớ đăng nhập
          </label>
          <Link to="/auth/signin" className="text-sm font-medium text-blue-600 hover:underline">
            Quên mật khẩu?
          </Link>
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
          Đăng nhập
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Chưa có tài khoản?{" "}
        <Link to="/auth/signup" className="font-semibold text-blue-600 hover:underline">
          Đăng ký
        </Link>
      </p>
    </AuthLayout>
  );
}
