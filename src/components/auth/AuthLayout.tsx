import { Mic } from "lucide-react";
import type { ReactNode } from "react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex w-full flex-col px-8 py-10 md:w-1/2 md:px-20 lg:px-28 lg:py-16">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <Mic className="h-5 w-5" fill="currentColor" />
            </div>
            <span className="text-2xl font-bold text-slate-900">OnAir</span>
          </div>
          {children}
        </div>
      </div>
      <div
        className="relative hidden overflow-hidden md:block md:w-1/2"
        aria-hidden
        style={{
          background:
            "linear-gradient(135deg, #60a5fa 0%, #818cf8 35%, #a78bfa 70%, #c084fc 100%)",
        }}
      >
        <div
          className="absolute -left-32 top-1/4 h-[700px] w-[700px] rounded-full opacity-40"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute -right-40 bottom-0 h-[600px] w-[600px] rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, rgba(167,139,250,0.8) 0%, transparent 70%)",
          }}
        />
      </div>
    </div>
  );
}
