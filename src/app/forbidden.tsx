import LockPersonRounded from "@mui/icons-material/LockPersonRounded";
import Link from "next/link";

import { PATHS } from "@/constants/path.constant";
export default function Forbidden() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_18%_20%,#F7FBFF_0%,#E1EAFB_45%,#F3F6FF_100%)] px-6 py-12 text-[#0B2C6E]">
      <div className="absolute inset-0 opacity-80">
        <div className="absolute left-[-18%] top-[20%] h-[46vh] w-[46vw] rounded-[70px] bg-linear-to-br from-white/80 via-[#D1E1FF]/70 to-[#8AB2FF]/50 blur-3xl" />
        <div className="absolute right-[-22%] top-[28%] h-[52vh] w-[52vw] rounded-[70px] bg-linear-to-bl from-white/60 via-[#C9DAFF]/50 to-[#7AA8FF]/40 blur-[120px]" />
      </div>

      <div className="relative z-10 flex max-w-3xl flex-col items-center gap-6 rounded-[26px] border border-white/60 bg-white/60 px-8 py-10 text-center shadow-[0_35px_120px_rgba(12,90,216,0.16)] backdrop-blur-2xl sm:px-12 sm:py-14">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#0C5AD8]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0C4EB8]">
          Truy cập bị chặn
        </span>
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0C5AD8]/10 text-[#0C5AD8] shadow-[0_14px_40px_rgba(12,90,216,0.2)]">
          <LockPersonRounded fontSize="large" />
        </div>
        <p className="text-[6rem] font-semibold leading-none text-[#0C5AD8] sm:text-[7rem]">403</p>
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold text-[#0C3D99] sm:text-3xl">Bạn không có quyền truy cập nội dung này</h1>
          <p className="text-base text-[#4564A3] sm:text-lg">
            Có thể bạn chưa được phân quyền hoặc phiên đăng nhập đã hết hạn. Quay lại bảng điều khiển hoặc liên hệ quản trị viên để tiếp tục.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-[#0C5AD8]/30 bg-white/70 px-6 py-3 text-sm font-semibold text-[#0C5AD8] shadow-[0_10px_30px_rgba(12,90,216,0.18)] transition hover:-translate-y-[1px] hover:border-[#0C5AD8]/50 hover:text-[#0C5AD8] focus:outline-none focus:ring-2 focus:ring-[#0C5AD8]/30 focus:ring-offset-2"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
