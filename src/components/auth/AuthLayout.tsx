import { Zap } from "lucide-react";
import type { ReactNode } from "react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex w-full flex-col px-8 py-10 md:w-1/2 md:px-16 lg:px-24">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Zap className="h-5 w-5" fill="currentColor" />
          </div>
          <span className="text-lg font-semibold text-slate-900">OnAir TMS</span>
        </div>
        <div className="flex flex-1 items-center">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
      <div
        className="hidden md:block md:w-1/2"
        style={{
          background:
            "linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)",
        }}
        aria-hidden
      />
    </div>
  );
}
