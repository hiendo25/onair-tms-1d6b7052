import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, Video, MonitorPlay, MapPin } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/admin/class-room/new")({
  head: () => ({ meta: [{ title: "Tạo lớp học — OnAir TMS" }] }),
  component: Page,
});

const DELIVERIES = [
  { value: "live", label: "Lớp học trực tuyến (Live)", desc: "Buổi học diễn ra qua nền tảng trực tuyến. Người tham gia có thể học ở bất kỳ đâu chỉ với kết nối Internet.", Icon: Video, color: "text-rose-600" },
  { value: "online", label: "Lớp học E-learning (Online)", desc: "Khoá học học qua video và tài liệu số. Học viên có thể học bất cứ lúc nào, theo tiến độ riêng của mình.", Icon: MonitorPlay, color: "text-sky-600" },
  { value: "offline", label: "Lớp học trực tiếp (Offline)", desc: "Buổi học tổ chức tại địa điểm thực tế. Học viên tham gia gặp gỡ, trao đổi và trải nghiệm trực tiếp cùng giảng viên.", Icon: MapPin, color: "text-amber-600" },
] as const;

const MODES = [
  { value: "single", label: "Lớp đơn", desc: "Diễn ra trong một buổi duy nhất với thời gian cố định.", emoji: "🗓️" },
  { value: "series", label: "Lớp chuỗi", desc: "Gồm nhiều lớp học diễn ra vào các khung giờ khác nhau.", emoji: "🛍️" },
] as const;

function Page() {
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState<string>("live");
  const [mode, setMode] = useState<string>("single");

  return (
    <PageContainer
      title="Tạo lớp học"
      breadcrumbs={[{ title: "Quản lý lớp học", path: "/admin/class-room" }, { title: "Tạo lớp học" }]}
    >
      <div className="flex justify-center">
        <Card className="w-full max-w-4xl">
          <CardContent className="p-8 space-y-6">
            <h2 className="text-center text-xl font-semibold">Chọn loại lớp học</h2>

            <div className="rounded-xl bg-muted/40 p-5 grid gap-5 md:grid-cols-3">
              {DELIVERIES.map(d => {
                const active = delivery === d.value;
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDelivery(d.value)}
                    className={cn(
                      "text-left rounded-lg p-3 transition outline-none",
                      active ? "bg-background ring-2 ring-primary" : "hover:bg-background/60"
                    )}
                  >
                    <div className={cn("font-semibold mb-1", active && "text-primary")}>{d.label}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed">{d.desc}</div>
                  </button>
                );
              })}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {MODES.map(m => {
                const active = mode === m.value;
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMode(m.value)}
                    className={cn(
                      "relative text-left rounded-xl border-2 p-5 transition",
                      active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                    )}
                  >
                    <div className="absolute right-4 top-4 h-5 w-5 rounded-full border-2 flex items-center justify-center"
                      style={{ borderColor: active ? "hsl(var(--primary))" : "hsl(var(--border))" }}>
                      {active && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                    </div>
                    <div className="text-2xl mb-3">{m.emoji}</div>
                    <div className="font-semibold mb-1">{m.label}</div>
                    <div className="text-sm text-muted-foreground">{m.desc}</div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-center pt-2">
              <Button
                size="lg"
                className="px-8"
                onClick={() => navigate({ to: "/admin/class-room/create", search: { delivery, mode } })}
              >
                Bắt đầu ngay <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
