import { createFileRoute, Link } from "@tanstack/react-router";
import {
  GraduationCap,
  ArrowRight,
  Play,
  Check,
  Users,
  Route as RouteIcon,
  Award,
  BarChart3,
  Smartphone,
  Sparkles,
  ShieldCheck,
  Zap,
  Brain,
  Star,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import heroDashboard from "@/assets/landing-hero-dashboard.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OnAir TMS — Nền tảng đào tạo cho chuỗi doanh nghiệp Việt" },
      {
        name: "description",
        content:
          "Triển khai đào tạo cho hàng nghìn nhân viên trên 200+ cửa hàng. Được tin dùng bởi các chuỗi F&B, bán lẻ, dược phẩm hàng đầu Việt Nam.",
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
  { name: "Highlands Coffee", color: "#A4161A" },
  { name: "Pharmacity", color: "#0066B3" },
  { name: "Di Động Việt", color: "#E30613" },
  { name: "Circle K", color: "#ED1C24" },
  { name: "The Coffee House", color: "#F37021" },
  { name: "WinMart", color: "#E60012" },
];

const FEATURES = [
  {
    icon: GraduationCap,
    title: "Khóa học đa dạng",
    desc: "Tạo khóa học video, tài liệu, quiz và bài tập thực hành chỉ trong vài phút. Hỗ trợ SCORM, xAPI.",
    color: "from-violet-500 to-fuchsia-500",
  },
  {
    icon: RouteIcon,
    title: "Lộ trình học cá nhân",
    desc: "Tự động phân lộ trình theo vị trí, cửa hàng và thâm niên. Mỗi nhân viên có hành trình riêng.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Users,
    title: "Lớp học trực tiếp",
    desc: "Tổ chức lớp học offline tại cửa hàng với điểm danh QR, theo dõi sĩ số và tiến độ realtime.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Award,
    title: "Chứng chỉ tự động",
    desc: "Cấp chứng chỉ VSATTP, nghiệp vụ pha chế, dược... ngay sau khi hoàn thành. PDF có mã QR xác thực.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: BarChart3,
    title: "Báo cáo theo cửa hàng",
    desc: "Theo dõi tỷ lệ hoàn thành theo branch, vùng, khu vực. Dashboard cho quản lý vùng và HR.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Smartphone,
    title: "Học mọi lúc, mọi nơi",
    desc: "App mobile cho nhân viên ca kíp. Học giữa các ca, đồng bộ tiến độ, hoạt động cả khi offline.",
    color: "from-indigo-500 to-purple-500",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Import nhân viên",
    desc: "Upload file Excel hoặc đồng bộ từ HRIS. Tự động phân nhóm theo cửa hàng và vị trí.",
  },
  {
    n: "02",
    title: "Tạo khóa & gán lộ trình",
    desc: "Dùng template có sẵn hoặc AI tạo khóa từ tài liệu. Gán theo vai trò chỉ với 1 click.",
  },
  {
    n: "03",
    title: "Theo dõi & cấp chứng chỉ",
    desc: "Dashboard realtime, nhắc việc tự động qua Zalo/Email, chứng chỉ cấp ngay khi đạt.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "OnAir TMS giúp chúng tôi triển khai chương trình VSATTP cho 200+ cửa hàng chỉ trong 2 tuần. Tỷ lệ hoàn thành đạt 94%, trước đây phải mất 3 tháng.",
    name: "Nguyễn Thị Hương",
    role: "Trưởng phòng Đào tạo",
    org: "Highlands Coffee",
    avatar: "https://i.pravatar.cc/120?img=47",
  },
  {
    quote:
      "Lộ trình học cá nhân hóa cho từng vị trí dược sĩ giúp đảm bảo chất lượng tư vấn đồng đều trên toàn hệ thống. ROI thấy rõ ngay quý đầu.",
    name: "Trần Văn Minh",
    role: "Giám đốc Nhân sự",
    org: "Pharmacity",
    avatar: "https://i.pravatar.cc/120?img=12",
  },
  {
    quote:
      "App mobile gọn nhẹ, nhân viên ca kíp học được giữa giờ. Báo cáo theo cửa hàng giúp quản lý vùng nắm tình hình tức thì.",
    name: "Lê Quang Tuấn",
    role: "L&D Manager",
    org: "Di Động Việt",
    avatar: "https://i.pravatar.cc/120?img=33",
  },
];

const PRICING = [
  {
    name: "Starter",
    price: "1.990.000",
    desc: "Cho doanh nghiệp dưới 100 nhân viên",
    features: [
      "Tối đa 100 nhân viên",
      "Khóa học không giới hạn",
      "Báo cáo cơ bản",
      "Hỗ trợ qua email",
    ],
    cta: "Bắt đầu miễn phí",
    highlight: false,
  },
  {
    name: "Business",
    price: "5.990.000",
    desc: "Phổ biến nhất cho chuỗi 100-1000 nhân viên",
    features: [
      "Tối đa 1.000 nhân viên",
      "Lộ trình học cá nhân hóa",
      "Lớp học offline + QR điểm danh",
      "Chứng chỉ tùy chỉnh",
      "Báo cáo nâng cao theo cửa hàng",
      "Hỗ trợ 24/7 ưu tiên",
    ],
    cta: "Dùng thử 14 ngày",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Liên hệ",
    desc: "Cho chuỗi 1000+ nhân viên, đa thương hiệu",
    features: [
      "Không giới hạn nhân viên",
      "Multi-tenant & SSO",
      "AI Course Creator",
      "API & tích hợp HRIS",
      "Account manager riêng",
      "SLA cam kết",
    ],
    cta: "Đặt lịch demo",
    highlight: false,
  },
];

function Landing() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 shadow-lg shadow-violet-500/30">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">OnAir TMS</span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                {n.label}
              </a>
            ))}
            <Link
              to="/auth/signin"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Đăng nhập
            </Link>
          </nav>
          <div className="hidden md:block">
            <Link to="/auth/signup">
              <Button className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 text-white shadow-lg shadow-violet-500/30 hover:opacity-95">
                Dùng thử miễn phí
              </Button>
            </Link>
          </div>
          <button
            className="rounded-md p-2 md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <div className="border-t border-slate-200 bg-white px-6 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              {NAV.map((n) => (
                <a key={n.href} href={n.href} className="text-sm text-slate-700">
                  {n.label}
                </a>
              ))}
              <Link to="/auth/signin" className="text-sm text-slate-700">
                Đăng nhập
              </Link>
              <Link to="/auth/signup">
                <Button className="w-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white">
                  Dùng thử miễn phí
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-violet-50 via-white to-white">
        {/* animated background blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 -left-32 h-[500px] w-[500px] animate-pulse rounded-full bg-violet-300/40 blur-3xl" />
          <div
            className="absolute -top-20 right-0 h-[420px] w-[420px] animate-pulse rounded-full bg-fuchsia-300/40 blur-3xl"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute top-60 left-1/3 h-[300px] w-[300px] animate-pulse rounded-full bg-cyan-300/30 blur-3xl"
            style={{ animationDelay: "2s" }}
          />
        </div>

        <div className="mx-auto max-w-7xl px-6 pt-20 pb-24 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-4 py-1.5 text-xs font-medium text-violet-700 shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Mới: AI Course Creator — tạo khóa học từ tài liệu
            trong 2 phút
          </div>

          <h1 className="mx-auto mt-8 max-w-5xl text-[44px] font-bold leading-[1.05] tracking-tight text-slate-900 sm:text-[56px] lg:text-[64px]">
            Đào tạo hàng nghìn nhân viên,{" "}
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
              chuẩn hóa toàn chuỗi
            </span>{" "}
            chỉ trong vài tuần
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Nền tảng LMS dành riêng cho chuỗi F&B, bán lẻ, dược phẩm Việt Nam. Triển khai nhanh, đo
            lường rõ ràng, chi phí tối ưu.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/auth/signup">
              <Button
                size="lg"
                className="group h-12 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-8 text-base font-semibold text-white shadow-xl shadow-violet-500/30 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/40"
              >
                Dùng thử miễn phí 14 ngày
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-slate-300 bg-white px-8 text-base font-semibold text-slate-900 hover:bg-slate-50"
            >
              <Play className="h-4 w-4 fill-current" /> Xem demo 2 phút
            </Button>
          </div>

          <p className="mt-5 text-xs text-slate-500">
            Không cần thẻ tín dụng · Setup trong 5 phút · Hỗ trợ tiếng Việt
          </p>

          {/* Hero image */}
          <div className="relative mx-auto mt-16 max-w-6xl">
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 opacity-30 blur-2xl" />
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-violet-500/20 ring-1 ring-slate-900/5">
              <img
                src={heroDashboard}
                alt="OnAir TMS dashboard"
                width={1920}
                height={1080}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section id="customers" className="border-y border-slate-100 bg-slate-50 py-14">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-center text-sm font-medium uppercase tracking-wider text-slate-500">
            Được tin dùng bởi 50+ chuỗi doanh nghiệp hàng đầu Việt Nam
          </p>
          <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
            {LOGOS.map((l) => (
              <div
                key={l.name}
                className="flex items-center justify-center text-center text-base font-bold tracking-tight transition-opacity hover:opacity-100"
                style={{ color: l.color }}
              >
                {l.name}
              </div>
            ))}
          </div>
          <div className="mt-12 grid grid-cols-2 gap-6 border-t border-slate-200 pt-10 md:grid-cols-4">
            {[
              { v: "1.240+", l: "Nhân viên đào tạo / tháng" },
              { v: "200+", l: "Cửa hàng triển khai" },
              { v: "87%", l: "Tỷ lệ hoàn thành khóa" },
              { v: "94%", l: "Khách hàng hài lòng" },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <div className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
                  {s.v}
                </div>
                <div className="mt-1 text-sm text-slate-600">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-700">
              Tính năng
            </span>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-[40px]">
              Mọi thứ bạn cần để{" "}
              <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
                chuẩn hóa đào tạo
              </span>
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Một nền tảng — tất cả nghiệp vụ đào tạo của chuỗi của bạn.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-500/10"
              >
                <div
                  className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} text-white shadow-lg`}
                >
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.desc}</p>
                <div className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-transform duration-500 group-hover:scale-x-100" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — colored section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-700 via-violet-600 to-fuchsia-600 py-24 text-white">
        <div className="absolute inset-0 -z-0 opacity-20">
          <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-pink-300 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
              Quy trình
            </span>
            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-[40px]">
              3 bước để go-live
            </h2>
            <p className="mt-4 text-lg text-violet-100">
              Từ ký hợp đồng đến nhân viên đầu tiên hoàn thành khóa — chưa đến 1 tuần.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-sm transition-all hover:-translate-y-1 hover:bg-white/15"
              >
                <div className="font-display text-5xl font-bold text-white/40">{s.n}</div>
                <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-violet-100">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI HIGHLIGHT */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                <Sparkles className="h-3 w-3" /> AI mới
              </span>
              <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-[40px]">
                Tạo khóa học bằng AI trong{" "}
                <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
                  2 phút
                </span>
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Upload tài liệu PDF, SOP nội bộ hoặc video đào tạo. AI tự động tạo bài học, câu hỏi
                trắc nghiệm và flashcard ôn tập.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Tự động tạo 20 câu hỏi từ tài liệu VSATTP",
                  "Tóm tắt khóa học và sinh flashcard",
                  "AI Tutor chat 24/7 cho học viên",
                  "Phân tích insight cho L&D Manager",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-slate-700">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500">
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    </div>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-violet-300 to-fuchsia-300 opacity-40 blur-2xl" />
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
                <div className="mb-4 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-violet-600" />
                  <span className="text-sm font-semibold">AI Course Creator</span>
                </div>
                <div className="space-y-3">
                  <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                    📄 quy-trinh-vsattp-2026.pdf · 24 trang
                  </div>
                  <div className="rounded-lg border border-violet-200 bg-violet-50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-violet-700">
                      <Zap className="h-3 w-3" /> AI đang tạo...
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 w-full rounded-full bg-violet-200">
                        <div className="h-2 w-3/4 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" />
                      </div>
                      <div className="text-xs text-slate-600">
                        ✓ Tóm tắt 5 module · ✓ 20 câu hỏi · ⟳ Flashcards...
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {["5 Module", "20 Quiz", "30 Cards"].map((c) => (
                      <div
                        key={c}
                        className="rounded-lg border border-slate-200 bg-white py-2 text-xs font-medium text-slate-700"
                      >
                        {c}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-700">
              Khách hàng nói gì
            </span>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-[40px]">
              Doanh nghiệp Việt tin dùng
            </h2>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-[15px] leading-relaxed text-slate-700">"{t.quote}"</p>
                <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    width={44}
                    height={44}
                    loading="lazy"
                    className="h-11 w-11 rounded-full object-cover"
                  />
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{t.name}</div>
                    <div className="text-xs text-slate-500">
                      {t.role} · <span className="font-medium text-slate-700">{t.org}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-700">
              Bảng giá
            </span>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-[40px]">
              Giá minh bạch, mở rộng linh hoạt
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Tiết kiệm 20% khi thanh toán theo năm. Hủy bất cứ lúc nào.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {PRICING.map((p) => (
              <div
                key={p.name}
                className={`relative rounded-2xl border bg-white p-8 transition-all hover:-translate-y-1 ${
                  p.highlight
                    ? "border-violet-300 shadow-2xl shadow-violet-500/20 ring-2 ring-violet-500"
                    : "border-slate-200 shadow-sm hover:shadow-xl"
                }`}
              >
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-1 text-xs font-semibold text-white shadow-lg">
                    Phổ biến nhất
                  </div>
                )}
                <h3 className="text-lg font-semibold text-slate-900">{p.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{p.desc}</p>
                <div className="mt-5">
                  {p.price === "Liên hệ" ? (
                    <div className="text-4xl font-bold text-slate-900">Liên hệ</div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-slate-900">{p.price}</span>
                      <span className="text-sm text-slate-500">đ/tháng</span>
                    </div>
                  )}
                </div>
                <Link to="/auth/signup" className="mt-6 block">
                  <Button
                    className={`h-11 w-full rounded-full font-semibold ${
                      p.highlight
                        ? "bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30 hover:opacity-95"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    {p.cta}
                  </Button>
                </Link>
                <ul className="mt-7 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" strokeWidth={3} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex items-center justify-center gap-2 text-sm text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> Bảo mật ISO 27001 · Tuân thủ Nghị
            định 13/2023 về bảo vệ dữ liệu cá nhân
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-violet-600 to-fuchsia-600 px-8 py-16 text-center text-white shadow-2xl shadow-violet-500/30 sm:px-16">
            <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-pink-300/30 blur-3xl" />
            <div className="relative">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Sẵn sàng nâng cấp đào tạo cho chuỗi của bạn?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-violet-100">
                Dùng thử miễn phí 14 ngày. Đội ngũ Customer Success Việt Nam hỗ trợ setup từ A-Z.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link to="/auth/signup">
                  <Button
                    size="lg"
                    className="h-12 rounded-full bg-white px-8 text-base font-semibold text-violet-700 shadow-xl transition-transform hover:scale-105"
                  >
                    Dùng thử miễn phí
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full border-white/40 bg-transparent px-8 text-base font-semibold text-white hover:bg-white/10 hover:text-white"
                >
                  Đặt lịch demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-slate-50 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-10 md:grid-cols-4">
            <div>
              <Link to="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500">
                  <GraduationCap className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold">OnAir TMS</span>
              </Link>
              <p className="mt-3 text-sm text-slate-600">
                Nền tảng đào tạo cho chuỗi doanh nghiệp Việt Nam.
              </p>
            </div>
            {[
              { title: "Sản phẩm", links: ["Tính năng", "Bảng giá", "AI", "Bảo mật"] },
              { title: "Công ty", links: ["Về chúng tôi", "Khách hàng", "Tuyển dụng", "Liên hệ"] },
              { title: "Hỗ trợ", links: ["Tài liệu", "Trung tâm trợ giúp", "API docs", "Status"] },
            ].map((c) => (
              <div key={c.title}>
                <h4 className="text-sm font-semibold text-slate-900">{c.title}</h4>
                <ul className="mt-4 space-y-2">
                  {c.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-sm text-slate-600 hover:text-slate-900">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row">
            <span>© 2026 OnAir TMS. All rights reserved.</span>
            <div className="flex gap-5">
              <a href="#" className="hover:text-slate-900">Điều khoản</a>
              <a href="#" className="hover:text-slate-900">Bảo mật</a>
              <a href="#" className="hover:text-slate-900">Cookie</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
