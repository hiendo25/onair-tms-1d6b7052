import { createFileRoute, Link } from "@tanstack/react-router";
import {
  GraduationCap,
  ArrowRight,
  Play,
  Check,
  Store,
  Users,
  Route as RouteIcon,
  Award,
  BarChart3,
  Smartphone,
  Quote,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OnAir LMS — Nền tảng đào tạo cho chuỗi doanh nghiệp Việt" },
      {
        name: "description",
        content:
          "OnAir LMS là nền tảng đào tạo nội bộ dành cho chuỗi F&B, bán lẻ, dược phẩm — giúp triển khai đào tạo nhanh, đo lường hiệu quả và chuẩn hoá nghiệp vụ trên toàn hệ thống.",
      },
      { property: "og:title", content: "OnAir LMS — Đào tạo cho chuỗi doanh nghiệp Việt" },
      {
        property: "og:description",
        content:
          "Triển khai đào tạo cho hàng nghìn nhân viên trên 200+ cửa hàng. Được tin dùng bởi các chuỗi hàng đầu Việt Nam.",
      },
    ],
  }),
  component: Landing,
});

const NAV = [
  { label: "Tính năng", href: "#features" },
  { label: "Khách hàng", href: "#customers" },
  { label: "Bảng giá", href: "#pricing" },
];

const LOGOS = [
  "Highlands Coffee",
  "Pharmacity",
  "Di Động Việt",
  "Circle K",
  "Guardian",
  "Thế Giới Di Động",
];

const FEATURES = [
  {
    icon: Store,
    title: "Đào tạo cho chuỗi cửa hàng",
    desc: "Triển khai chương trình đào tạo đồng bộ cho 200+ cửa hàng chỉ trong vài phút. Mỗi cửa hàng, mỗi vùng đều cập nhật giáo trình mới nhất.",
  },
  {
    icon: Users,
    title: "Quản lý nhân sự đa cấp",
    desc: "Phân quyền theo Giám đốc Vùng → Quản lý cửa hàng → Trưởng ca → Nhân viên. Theo dõi tiến độ học tập theo từng cấp.",
  },
  {
    icon: RouteIcon,
    title: "Lộ trình học tập cá nhân hoá",
    desc: "Tự động gán lộ trình theo vị trí: Onboarding nhân viên mới, Thăng tiến Trưởng ca, Đào tạo Quản lý cửa hàng.",
  },
  {
    icon: Award,
    title: "Chứng chỉ số tự động cấp",
    desc: "Cấp chứng chỉ VSATTP, Pha chế chuẩn, Nhân viên Xuất sắc theo mẫu doanh nghiệp ngay sau khi học viên đạt yêu cầu.",
  },
  {
    icon: BarChart3,
    title: "Báo cáo & Phân tích thời gian thực",
    desc: "Dashboard hiển thị tỷ lệ hoàn thành theo cửa hàng, vùng, phòng ban. Xuất báo cáo PDF/Excel cho Ban Giám đốc.",
  },
  {
    icon: Smartphone,
    title: "Mobile-first cho nhân viên cửa hàng",
    desc: "Học mọi lúc trên điện thoại — tối ưu cho nhân viên pha chế, thu ngân, dược sĩ học tranh thủ giữa ca.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Tải lên nội dung đào tạo",
    desc: "Import giáo trình, video, slide có sẵn hoặc dùng template chuẩn ngành F&B / bán lẻ / dược phẩm.",
  },
  {
    n: "02",
    title: "Phân nhân sự & gán lộ trình",
    desc: "Đồng bộ danh sách nhân viên từ HRM, gán lộ trình tự động theo chi nhánh, phòng ban, vị trí công việc.",
  },
  {
    n: "03",
    title: "Theo dõi & báo cáo",
    desc: "Quản lý đào tạo nhận báo cáo thời gian thực. Cấp chứng chỉ tự động khi nhân viên hoàn thành.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "OnAir giúp Highlands triển khai đào tạo VSATTP cho 1.240 nhân viên trên 200+ cửa hàng chỉ trong 2 tuần — điều mà trước đây chúng tôi mất 3 tháng để làm thủ công.",
    name: "Chị Nguyễn Thị Mai Linh",
    role: "Trưởng phòng Đào tạo & Phát triển — Highlands Coffee Vietnam",
  },
  {
    quote:
      "Tỷ lệ hoàn thành khoá đào tạo nghiệp vụ dược của chuỗi tăng từ 62% lên 94% sau 1 quý dùng OnAir. Báo cáo theo từng nhà thuốc giúp Ban Giám đốc ra quyết định nhanh hơn.",
    name: "Anh Phạm Quang Huy",
    role: "Giám đốc Vận hành — Pharmacity",
  },
  {
    quote:
      "Mỗi khi mở cửa hàng mới, chúng tôi chỉ cần 1 tuần để onboarding nhân viên thay vì 1 tháng như trước. OnAir là một phần không thể thiếu của vận hành chuỗi.",
    name: "Chị Lê Thanh Tùng",
    role: "Trưởng ban Đào tạo — Di Động Việt",
  },
];

const PLANS = [
  {
    name: "Starter",
    price: "2.900.000",
    desc: "Phù hợp chuỗi 5–20 cửa hàng, mới bắt đầu chuẩn hoá đào tạo nội bộ.",
    features: [
      "Tối đa 200 nhân viên",
      "Khoá học không giới hạn",
      "Lộ trình Onboarding mẫu",
      "Báo cáo cơ bản",
      "Hỗ trợ qua email",
    ],
    cta: "Dùng thử 14 ngày",
    highlight: false,
  },
  {
    name: "Business",
    price: "9.900.000",
    desc: "Dành cho chuỗi 20–100 cửa hàng cần triển khai đào tạo có hệ thống.",
    features: [
      "Tối đa 1.000 nhân viên",
      "Lộ trình theo vị trí công việc",
      "Cấp chứng chỉ tự động",
      "Báo cáo theo cửa hàng & vùng",
      "App di động riêng thương hiệu",
      "Hỗ trợ chuyên viên 8x5",
    ],
    cta: "Bắt đầu ngay",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Liên hệ",
    desc: "Tuỳ chỉnh cho chuỗi 100+ cửa hàng, tích hợp HRM/POS sẵn có.",
    features: [
      "Không giới hạn nhân viên",
      "Tích hợp HRM, SSO, POS",
      "Tuỳ biến giao diện & domain",
      "SLA 99.9% & hỗ trợ 24/7",
      "Tư vấn triển khai chuyên sâu",
      "Cố vấn nội dung đào tạo",
    ],
    cta: "Liên hệ tư vấn",
    highlight: false,
  },
];

function Landing() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">OnAir LMS</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
              >
                {n.label}
              </a>
            ))}
            <Link
              to="/auth/signin"
              className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              Đăng nhập
            </Link>
          </nav>

          <div className="hidden md:block">
            <Button asChild size="sm" className="rounded-full px-5">
              <Link to="/auth/signup">Dùng thử miễn phí</Link>
            </Button>
          </div>

          <button
            type="button"
            aria-label="Menu"
            onClick={() => setOpen((s) => !s)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-border/60 md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
              {NAV.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                  onClick={() => setOpen(false)}
                >
                  {n.label}
                </a>
              ))}
              <Link
                to="/auth/signin"
                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                Đăng nhập
              </Link>
              <Button asChild size="sm" className="mt-2 w-full">
                <Link to="/auth/signup">Dùng thử miễn phí</Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="absolute -top-24 left-1/2 -z-10 h-[480px] w-[880px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-foreground/70 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Được tin dùng bởi 500+ chuỗi tại Việt Nam
            </div>
            <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Nền tảng đào tạo dành cho{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                chuỗi doanh nghiệp Việt
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground/70 sm:text-xl">
              Triển khai đào tạo nội bộ cho hàng nghìn nhân viên trên 200+ cửa hàng — F&B, bán lẻ,
              dược phẩm, điện tử. Chuẩn hoá nghiệp vụ, đo lường hiệu quả, cấp chứng chỉ tự động.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 rounded-full px-7 text-base">
                <Link to="/auth/signup">
                  Dùng thử miễn phí
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full px-7 text-base"
              >
                <a href="#features">
                  <Play className="mr-1 h-4 w-4" />
                  Xem demo
                </a>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Miễn phí 14 ngày · Không cần thẻ tín dụng · Hỗ trợ tiếng Việt
            </p>
          </div>

          {/* Hero mockup */}
          <div className="relative mx-auto mt-16 max-w-5xl">
            <div className="absolute -inset-4 rounded-[28px] bg-gradient-to-br from-primary/30 to-primary/5 blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
              <div className="flex items-center gap-1.5 border-b border-border bg-muted/40 px-4 py-2.5">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs text-muted-foreground">app.onair-lms.vn/dashboard</span>
              </div>
              <div className="grid grid-cols-12 gap-0">
                <aside className="col-span-3 border-r border-border bg-muted/20 p-4">
                  <div className="space-y-2">
                    {["Dashboard", "Lớp học", "Khoá học", "Lộ trình", "Bài kiểm tra", "Báo cáo"].map(
                      (i, idx) => (
                        <div
                          key={i}
                          className={`rounded-md px-3 py-2 text-xs ${idx === 0 ? "bg-primary/10 font-semibold text-primary" : "text-foreground/60"}`}
                        >
                          {i}
                        </div>
                      ),
                    )}
                  </div>
                </aside>
                <main className="col-span-9 space-y-4 p-5">
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { l: "Lớp đang DR", v: "23", c: "bg-pink-100 text-pink-600" },
                      { l: "Lớp sắp DR", v: "14", c: "bg-blue-100 text-blue-600" },
                      { l: "Hoàn thành", v: "1.078", c: "bg-emerald-100 text-emerald-600" },
                      { l: "Chứng chỉ", v: "156", c: "bg-amber-100 text-amber-600" },
                    ].map((s) => (
                      <div key={s.l} className={`rounded-lg p-3 ${s.c}`}>
                        <div className="text-[10px] font-medium opacity-70">{s.l}</div>
                        <div className="mt-1 text-lg font-bold">{s.v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg border border-border bg-background p-4">
                    <div className="mb-3 text-xs font-semibold">
                      Tỷ lệ hoàn thành theo chi nhánh
                    </div>
                    <div className="flex h-32 items-end gap-2">
                      {[78, 92, 64, 88, 72, 96, 81, 70, 85, 90, 67, 83].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t bg-gradient-to-t from-primary to-primary/40"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </main>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section id="customers" className="border-y border-border/60 bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Được tin dùng bởi các chuỗi hàng đầu Việt Nam
          </p>
          <div className="mt-8 grid grid-cols-2 items-center gap-x-6 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
            {LOGOS.map((l) => (
              <div
                key={l}
                className="flex items-center justify-center text-center text-base font-bold tracking-tight text-foreground/50 transition-colors hover:text-foreground/80"
              >
                {l}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
              Tính năng
            </div>
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Tất cả những gì chuỗi của bạn cần để đào tạo hiệu quả
            </h2>
            <p className="mt-4 text-base text-foreground/70">
              Từ onboarding nhân viên mới đến đào tạo Quản lý cửa hàng — OnAir lo trọn vòng đời học
              tập của nhân sự chuỗi.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/70">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border/60 bg-muted/30 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
              Cách thức triển khai
            </div>
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Đưa toàn bộ chuỗi lên hệ thống chỉ trong 3 bước
            </h2>
          </div>

          <div className="relative mt-14 grid gap-8 lg:grid-cols-3">
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                className="relative rounded-2xl border border-border bg-card p-7 shadow-sm"
              >
                <div className="text-5xl font-black tracking-tight text-primary/20">{s.n}</div>
                <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/70">{s.desc}</p>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="absolute -right-5 top-1/2 hidden h-6 w-6 -translate-y-1/2 text-border lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
              Khách hàng nói gì
            </div>
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Hơn 500 chuỗi doanh nghiệp Việt đã chọn OnAir
            </h2>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.name}
                className="flex flex-col rounded-2xl border border-border bg-card p-7"
              >
                <Quote className="h-8 w-8 text-primary/30" />
                <blockquote className="mt-4 flex-1 text-base leading-relaxed text-foreground/80">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-6 border-t border-border pt-4">
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-sm text-muted-foreground">{t.role}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-y border-border/60 bg-muted/30 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
              Bảng giá
            </div>
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Gói linh hoạt theo quy mô chuỗi
            </h2>
            <p className="mt-4 text-base text-foreground/70">
              Đơn giản, minh bạch. Không phí ẩn. Huỷ bất kỳ lúc nào.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {PLANS.map((p) => (
              <div
                key={p.name}
                className={`relative flex flex-col rounded-2xl border p-7 ${
                  p.highlight
                    ? "border-primary bg-card shadow-xl ring-1 ring-primary"
                    : "border-border bg-card"
                }`}
              >
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Phổ biến nhất
                  </div>
                )}
                <h3 className="text-xl font-bold">{p.name}</h3>
                <p className="mt-2 text-sm text-foreground/70">{p.desc}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  {p.price === "Liên hệ" ? (
                    <span className="text-3xl font-extrabold">Liên hệ</span>
                  ) : (
                    <>
                      <span className="text-4xl font-extrabold tracking-tight">{p.price}đ</span>
                      <span className="text-sm text-muted-foreground">/tháng</span>
                    </>
                  )}
                </div>
                <ul className="mt-6 flex-1 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className="mt-7 w-full rounded-full"
                  variant={p.highlight ? "default" : "outline"}
                >
                  <Link to="/auth/signup">{p.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/70 px-8 py-14 text-center text-primary-foreground sm:px-12 sm:py-20">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <h2 className="relative text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Sẵn sàng chuẩn hoá đào tạo cho toàn bộ chuỗi?
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-base opacity-90">
              Bắt đầu miễn phí 14 ngày. Đội ngũ OnAir sẽ hỗ trợ thiết lập và import dữ liệu nhân
              sự cho bạn.
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="h-12 rounded-full px-7 text-base"
              >
                <Link to="/auth/signup">
                  Dùng thử miễn phí
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-white/40 bg-transparent px-7 text-base text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
              >
                <a href="mailto:sales@onair-lms.vn">Liên hệ tư vấn</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <span className="text-lg font-bold">OnAir LMS</span>
              </div>
              <p className="mt-4 max-w-sm text-sm text-foreground/70">
                Nền tảng đào tạo nội bộ dành riêng cho chuỗi doanh nghiệp Việt Nam — F&B, bán lẻ,
                dược phẩm, điện tử.
              </p>
            </div>
            <div>
              <div className="text-sm font-semibold">Sản phẩm</div>
              <ul className="mt-4 space-y-2 text-sm text-foreground/70">
                <li><a href="#features" className="hover:text-foreground">Tính năng</a></li>
                <li><a href="#pricing" className="hover:text-foreground">Bảng giá</a></li>
                <li><a href="#customers" className="hover:text-foreground">Khách hàng</a></li>
              </ul>
            </div>
            <div>
              <div className="text-sm font-semibold">Công ty</div>
              <ul className="mt-4 space-y-2 text-sm text-foreground/70">
                <li><a href="#" className="hover:text-foreground">Về chúng tôi</a></li>
                <li><a href="#" className="hover:text-foreground">Tuyển dụng</a></li>
                <li><a href="#" className="hover:text-foreground">Liên hệ</a></li>
              </ul>
            </div>
            <div>
              <div className="text-sm font-semibold">Hỗ trợ</div>
              <ul className="mt-4 space-y-2 text-sm text-foreground/70">
                <li><a href="#" className="hover:text-foreground">Trung tâm trợ giúp</a></li>
                <li><a href="#" className="hover:text-foreground">Tài liệu API</a></li>
                <li><a href="mailto:support@onair-lms.vn" className="hover:text-foreground">support@onair-lms.vn</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
            <div>© 2025 OnAir LMS. Bảo lưu mọi quyền.</div>
            <div className="flex gap-5">
              <a href="#" className="hover:text-foreground">Điều khoản</a>
              <a href="#" className="hover:text-foreground">Chính sách bảo mật</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
