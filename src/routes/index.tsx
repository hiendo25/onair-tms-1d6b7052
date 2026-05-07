import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OnAir LMS — Hệ thống đào tạo trực tuyến" },
      { name: "description", content: "Quản lý đào tạo, lớp học, bài kiểm tra và lộ trình học tập." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-muted px-4">
      <div className="max-w-2xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <GraduationCap className="h-9 w-9" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">OnAir LMS</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Nền tảng quản lý đào tạo, lớp học và lộ trình học tập cho doanh nghiệp.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/dashboard">
              Vào hệ thống
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
