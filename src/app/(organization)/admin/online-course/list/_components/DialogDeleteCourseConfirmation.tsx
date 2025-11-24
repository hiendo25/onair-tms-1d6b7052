import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { forwardRef, useImperativeHandle, useState, useTransition } from "react";

export type DialogDeleteCourseConfirmationRef = {
  open: (
    content: { title?: string; description?: string } | undefined,
    options?: {
      onOk?: () => void;
    },
  ) => void;
  close: () => void;
};
interface DialogDeleteCourseConfirmationProps {
  className?: string;
  isLoading?: boolean;
  onOk?: () => void;
  btnCancelText?: string;
  btnOkText?: string;
}
const DialogDeleteCourseConfirmation = forwardRef<
  DialogDeleteCourseConfirmationRef,
  DialogDeleteCourseConfirmationProps
>(({ isLoading, btnCancelText = "Hủy bỏ", btnOkText = "Đồng ý", onOk }, ref) => {
  const [dialogAction, setDialogAction] = useState<{ onOk?: () => void }>();
  const [{ open: openDialog, content: contentDialog }, setDialog] = useState({
    open: false,
    content: {
      title: "",
      description: "",
    },
  });

  const handleClose = () => {
    setDialog((prev) => ({ ...prev, open: false }));
  };

  const handleConfirm = () => {
    dialogAction?.onOk?.();
    onOk?.();
  };

  useImperativeHandle(ref, () => ({
    open: (content, options) => {
      setDialog((prev) => ({
        open: true,
        content: {
          title: content?.title ? content?.title : prev.content.title,
          description: content?.description ? content?.description : prev.content.description,
        },
      }));
      if (options) setDialogAction((prev) => ({ ...prev, onOk: options?.onOk }));
    },
    close: () => {
      setDialog((prev) => ({
        ...prev,
        open: false,
      }));
    },
  }));
  return (
    <Dialog
      open={openDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle id="alert-dialog-title" className="break-all">{`Xoá`}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description" className="break-all" sx={{ fontSize: "0.875rem" }}>
          {contentDialog.title}
        </DialogContentText>
        <DialogContentText id="alert-dialog-description" className="break-all" sx={{ fontSize: "0.875rem" }}>
          {contentDialog.description}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="outlined" color="inherit" disabled={isLoading}>
          {btnCancelText}
        </Button>
        <Button onClick={handleConfirm} color="error" loading={isLoading} disabled={isLoading}>
          {btnOkText}
        </Button>
      </DialogActions>
    </Dialog>
  );
});
export default DialogDeleteCourseConfirmation;
