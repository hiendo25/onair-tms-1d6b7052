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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted px-4">
      <Card className="w-full max-w-[450px] p-8">
        <div className="mb-6">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-semibold">Đăng nhập</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Truy cập vào OnAir TMS để bắt đầu hành trình học tập
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              placeholder="Mật khẩu của bạn"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            Đăng nhập
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Chưa có tài khoản?{" "}
          <Link to="/auth/signup" className="font-semibold text-primary">
            Đăng ký
          </Link>
        </p>
      </Card>
    </div>
  );
}
