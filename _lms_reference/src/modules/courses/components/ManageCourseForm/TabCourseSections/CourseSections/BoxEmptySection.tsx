import { memo } from "react";
import { Typography } from "@mui/material";
import Image from "next/image";

const BoxEmptySection = () => {
  return (
    <div className="max-w-[450px] mx-auto text-center">
      <Image src="/assets/icons/book-empty-2.svg" alt="empty book" width={180} height={120} className="mx-auto" />
      <div>
        <Typography variant="body2">Xây dựng kho tri thức nội bộ – bắt đầu từ chính bạn.</Typography>
      </div>
    </div>
  );
};
export default memo(BoxEmptySection);
