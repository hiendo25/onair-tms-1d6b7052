import { Container } from "@mui/material";

import TableDataSkeleton from "@/shared/ui/TableData/TableDataSkeleton";

export default function BranchesListLoadingPage() {
  return (
    <div className="skeleton-loading-list py-8">
      <div className="skeleton-item animate-pulse">
        <div className="title mb-8">
          <div className="bg-gray-100 max-w-[460px] h-6 rounded-xl mb-4"></div>
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 w-[80%] max-w-16 h-3 rounded-xl"></div>
            <div className="bg-gray-100 w-[80%] max-w-10 h-3 rounded-xl"></div>
            <div className="bg-gray-100 w-[80%] max-w-22 h-3 rounded-xl"></div>
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
