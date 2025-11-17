import { Typography } from "@mui/material";
import Image from "next/image";
import { memo } from "react";

const BoxEmptyLesson = () => {
  return (
    <div className="max-w-[450px] mx-auto text-center">
      <Image src="/assets/icons/book-empty.svg" alt="empty book" width={300} height={200} className="mx-auto" />
      <div>
        <Typography sx={{ fontWeight: "bold" }}>Tạo bài giảng ngay</Typography>
        <Typography variant="body2">
          Tạo bài giảng chưa bao giờ dễ dàng hơn – xây dựng nội dung một lần, lan tỏa giá trị mãi mãi!
        </Typography>
      </div>
    </div>
  );
};
export default memo(BoxEmptyLesson);
