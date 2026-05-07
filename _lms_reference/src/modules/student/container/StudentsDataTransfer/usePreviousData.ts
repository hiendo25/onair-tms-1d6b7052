import { useEffect, useRef } from "react";

import { GetStudentsResponse } from "@/repository/employee";
type StudentItem = NonNullable<GetStudentsResponse["data"]>[number];

type DataCopy = { total: number; pageTotal: number; page: number; pageSize: number; items: StudentItem[] };
const usePreviousData = (data: DataCopy, deps: any[]) => {
  const { total = 0, page = 1, pageSize = 10, pageTotal = 1, items = [] } = data || {};
  const copyRef = useRef<DataCopy>(data);

  useEffect(() => {
    copyRef.current.items = data.items;
    copyRef.current.page = data.page;
    copyRef.current.total = data.total;
    copyRef.current.pageSize = data.pageSize;
    copyRef.current.pageTotal = data.pageTotal;
  }, [deps]);

  return copyRef?.current
    ? copyRef.current
    : {
        total,
        page,
        pageSize,
        pageTotal,
        items,
      };
};
export default usePreviousData;
