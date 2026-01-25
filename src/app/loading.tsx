import { CircularProgress, Typography } from "@mui/material";

export default function LoadingPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_20%_20%,#E8F1FF_0%,#D5E4FF_40%,#EFF4FF_70%,#F9FBFF_100%)] text-[#0C3D99]">
      <div className="absolute inset-0 opacity-70">
        <div className="absolute -left-24 top-24 h-64 w-64 rounded-full bg-[#8CB4FF]/40 blur-3xl" />
        <div className="absolute right-[-12%] top-1/3 h-72 w-72 rounded-full bg-[#B9D2FF]/40 blur-[120px]" />
        <div className="absolute left-1/2 top-[70%] h-64 w-64 -translate-x-1/2 rounded-full bg-[#0C5AD8]/16 blur-[130px]" />
      </div>

      <div className="relative z-10 flex w-full max-w-xl flex-col items-center gap-6 rounded-[28px] border border-white/60 bg-white/70 px-10 py-12 shadow-[0_25px_120px_rgba(12,90,216,0.16)] backdrop-blur-2xl">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-linear-to-tr from-[#0C5AD8] via-[#7AA8FF] to-[#B7D4FF] opacity-70 blur-[1px]" />
          <div className="absolute inset-1.5 rounded-full bg-white" />
          <CircularProgress size={64} thickness={4} className="text-[#0C5AD8]" />
        </div>

        <div className="space-y-1 text-center">
          <Typography variant="h6" className="font-semibold text-[#0C3D99]">
            Đang tải
          </Typography>
          <Typography className="text-sm text-[#4564A3]">
            Chúng tôi đang chuẩn bị dữ liệu và nội dung cho bạn. Vui lòng đợi trong giây lát.
          </Typography>
        </div>
      </div>
    </div>
  );
}
