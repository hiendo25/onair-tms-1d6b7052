import { Container } from "@mui/material";

export default function SurveyStatisticLoading() {
  return (
    <div className="skeleton-loading-list">
      <div className="skeleton-item animate-pulse">
        <div className="header py-12 max-w-[1600px] mx-auto">
          <div className="title mb-12">
            <div className="bg-gray-100 max-w-[760px] h-6 rounded-xl mb-4"></div>
            <div className="bg-gray-100 w-[80%] max-w-[480px] h-6 rounded-xl"></div>
          </div>
          <div className="content mb-12">
            <div className="bg-gray-100 max-w-[560px] h-2 rounded-xl mb-3"></div>
            <div className="bg-gray-100 max-w-[320px] h-2 rounded-xl mb-3"></div>
          </div>
          <div className="flex flex-col gap-3">
            <div
              role="status"
              className="space-y-8 animate-pulse md:space-y-0 md:space-x-8 rtl:space-x-reverse md:flex md:items-center"
            >
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded-full max-w-3/4 mb-3"></div>
                <div className="h-2 bg-gray-200 rounded-full mb-2.5"></div>
                <div className="h-2 bg-gray-200 rounded-full mb-2.5"></div>
                <div className="h-2 bg-gray-200 rounded-full max-w-[440px]"></div>
              </div>
            </div>
            <div className="h-6"></div>
            <div
              role="status"
              className="space-y-8 animate-pulse md:space-y-0 md:space-x-8 rtl:space-x-reverse md:flex md:items-center"
            >
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded-full max-w-3/4 mb-3"></div>
                <div className="h-2 bg-gray-200 rounded-full mb-2.5"></div>
                <div className="h-2 bg-gray-200 rounded-full mb-2.5"></div>
                <div className="h-2 bg-gray-200 rounded-full max-w-[440px]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
