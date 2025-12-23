import Link from "next/link";

export async function generateMetadata() {
  return {
    title: `LMS  - ONAIR`,
  };
}

export default function NotFound() {
  return (
    <div className="relative flex h-full items-center justify-center bg-[radial-gradient(circle_at_20%_20%,#F5F9FF_0%,#E1E9FF_45%,#F6F8FF_100%)] px-6 py-10 text-[#103D9E]">
      <div className="absolute inset-0 opacity-30" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute right-[14%] top-[16%] h-[55vh] w-[55vw] rounded-[80px] bg-linear-to-br from-white/60 via-[#D3E3FF]/70 to-[#8BB5FF]/60 blur-2xl" />
        <div className="absolute right-[-18%] top-[34%] h-[50vh] w-[50vw] rounded-[80px] bg-linear-to-br from-white/20 via-[#C8DBFF]/40 to-[#6EA6FF]/50 blur-3xl" />
        <div className="absolute left-[-22%] top-[24%] h-[45vh] w-[45vw] rounded-full bg-white/70 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-xl text-center">
        <p className="text-[8rem] font-semibold leading-none text-[#0C5AD8] sm:text-[10rem]">404</p>
        <h1 className="mt-6 text-2xl font-semibold text-[#0C43B6] sm:text-3xl">Oops! Trang này không tồn tại!</h1>
        <p className="mt-4 text-base font-medium text-[#3F5B9A] sm:text-lg">
          Nội dung này không còn hoạt động, có thể vì bạn nhập sai đường dẫn hoặc trang đã bị gỡ bỏ
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-[#0C5AD8] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-[#0C5AD8]/40 focus:ring-offset-2"
        >
          Quay về trang chủ
        </Link>
      </div>
    </div>
  );
}
