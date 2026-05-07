import TableDataSkeleton from "@/shared/ui/TableData/TableDataSkeleton";

export default async function DepartmentDetailLoadingPage() {
  return (
    <div className="skeleton-loading-detail py-8">
      <div className="skeleton-item animate-pulse">
        <div className="title mb-8">
          <div className="bg-gray-100 max-w-[460px] h-6 rounded-xl mb-4" />
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 w-[80%] max-w-16 h-3 rounded-xl" />
            <div className="bg-gray-100 w-[80%] max-w-10 h-3 rounded-xl" />
            <div className="bg-gray-100 w-[80%] max-w-22 h-3 rounded-xl" />
          </div>
        </div>
        <div className="boxes grid grid-cols-4 gap-6 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-gray-100 rounded-full" />
            <div className="flex flex-col gap-2 flex-1">
              <div className="w-full max-w-60 h-3 bg-gray-100 rounded-lg" />
              <div className="w-full max-w-40 h-3 bg-gray-100 rounded-lg" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-gray-100 rounded-full" />
            <div className="flex flex-col gap-2 flex-1">
              <div className="w-full max-w-60 h-3 bg-gray-100 rounded-lg" />
              <div className="w-full max-w-40 h-3 bg-gray-100 rounded-lg" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-gray-100 rounded-full" />
            <div className="flex flex-col gap-2 flex-1">
              <div className="w-full max-w-60 h-3 bg-gray-100 rounded-lg" />
              <div className="w-full max-w-40 h-3 bg-gray-100 rounded-lg" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-gray-100 rounded-full" />
            <div className="flex flex-col gap-2 flex-1">
              <div className="w-full max-w-60 h-3 bg-gray-100 rounded-lg" />
              <div className="w-full max-w-40 h-3 bg-gray-100 rounded-lg" />
            </div>
          </div>
        </div>
        <div className="content mb-6 flex items-center justify-between">
          <div className="bg-gray-100 max-w-[280px] w-full h-10 rounded-lg"></div>
          <div className="bg-gray-100 max-w-[100px] w-full h-10 rounded-lg"></div>
        </div>
        <TableDataSkeleton rowCount={6} />
      </div>
    </div>
  );
}
