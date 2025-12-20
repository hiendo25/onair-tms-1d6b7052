import React from "react";

interface TableDataSkeletonProps {
  rowCount?: number;
}
const TableDataSkeleton: React.FC<TableDataSkeletonProps> = ({ rowCount = 6 }) => {
  return (
    <div className="flex flex-col border rounded-xl border-gray-100 p-4">
      {Array.from({ length: rowCount }).map((_, idx) => (
        <div key={idx} className="flex gap-4 md:gap-6 border-b border-gray-100 mb-4 pb-4">
          <div className="bg-gray-100 w-12 h-4 rounded-xl px-3 py-2"></div>
          <div className="bg-gray-100 w-[20%] h-4 rounded-xl px-3 py-2"></div>
          <div className="flex-1"></div>
          <div className="bg-gray-100 w-[15%] h-4 rounded-xl px-3 py-2"></div>
          <div className="bg-gray-100 w-[5%] h-4 rounded-xl px-3 py-2"></div>
          <div className="bg-gray-100 w-[10%] h-4 rounded-xl px-3 py-2"></div>
          <div className="bg-gray-100 w-[5%] h-4 rounded-xl px-3 py-2"></div>
        </div>
      ))}
      <div className="flex items-center justify-end gap-6 py-2">
        <div className="bg-gray-100 w-12 h-4 rounded-xl px-3 py-2"></div>
        <div className="bg-gray-100 w-20 h-4 rounded-xl"></div>
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 w-8 h-6 rounded-xl"></div>
          <div className="bg-gray-100 w-8 h-6 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
};
export default TableDataSkeleton;
