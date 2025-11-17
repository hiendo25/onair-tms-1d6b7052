import { PropsWithChildren, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material";
import { LessonType } from "@/model/lesson.model";
import { Trash01Icon } from "@/shared/assets/icons";
interface LessonFormWraperProps extends PropsWithChildren {
  lessonType: LessonType;
  onDelete?: () => void;
  label?: string;
}
const LessonFormWraper: React.FC<LessonFormWraperProps> = ({ onDelete, lessonType, children, label }) => {
  const [isOpenDialog, setIsOpenDialog] = useState(false);

  const handleOpenDialog = () => {
    setIsOpenDialog(true);
  };

  const handleCancelDelete = () => {
    setIsOpenDialog(false);
  };

  return (
    <div>
      <div className="mb-6 flex justify-between">
        <div className="flex-1 flex flex-col gap-2">
          {lessonType === "file" ? (
            <BoxLessonType name="PDF" className="bg-gray-900" />
          ) : lessonType === "video" ? (
            <BoxLessonType name="Video" className="bg-blue-600" />
          ) : lessonType === "assessment" ? (
            <BoxLessonType name="Bài kiểm tra" className="bg-purple-700" />
          ) : (
            <Typography>Unknown</Typography>
          )}
          <Typography sx={{ fontWeight: "bold" }}>Tạo Bài giảng</Typography>
        </div>
        <IconButton
          sx={(theme) => ({
            backgroundColor: "transparent",
            borderRadius: "8px",
            border: "1px solid",
            borderColor: theme.palette.grey["300"],
          })}
          size="small"
          onClick={handleOpenDialog}
        >
          <Trash01Icon className="w-4 h-4" />
        </IconButton>
      </div>
      <div className="lession-form flex flex-col gap-6">{children}</div>
      {onDelete ? (
        <Dialog
          open={isOpenDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle id="alert-dialog-title" className="break-all">
            Xoá bài giảng
          </DialogTitle>
          <div className="w-full h-px bg-gray-200"></div>
          <DialogContent className="flex flex-col gap-2">
            <Typography sx={{ fontSize: "0.875rem" }}>
              Xoá bài giảng <strong className="font-bold">{`"${label}"`}</strong> toàn bộ nội dung bên trong sẽ bị xoá
              và không thể khôi phục.
            </Typography>
            <Typography sx={{ fontSize: "0.875rem" }} variant="body2">
              Bạn có chắc chắn muốn tiếp tục không?
            </Typography>
          </DialogContent>
          <div className="w-full h-px bg-gray-200"></div>
          <DialogActions>
            <Button onClick={handleCancelDelete} variant="outlined" color="inherit">
              Huỷ
            </Button>
            <Button onClick={onDelete} color="error">
              Xoá học phần
            </Button>
          </DialogActions>
        </Dialog>
      ) : null}
    </div>
  );
};
export default LessonFormWraper;

interface BoxLessonTypeProps {
  name: string;
  className?: string;
}
const BoxLessonType: React.FC<BoxLessonTypeProps> = ({ name, className }) => {
  return (
    <Typography
      component="div"
      sx={() => ({
        backgroundColor: "black",
        borderRadius: "8px",
        padding: "6px 12px",
        width: "fit-content",
        fontSize: "0.75rem",
        color: "white",
        fontWeight: 600,
      })}
      className={className}
    >
      {name}
    </Typography>
  );
};
