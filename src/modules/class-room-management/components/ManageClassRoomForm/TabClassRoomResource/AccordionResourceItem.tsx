"use client";

import { PropsWithChildren, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  styled,
  Typography,
} from "@mui/material";

import { ChevronDownIcon, TrashIcon1 } from "@/shared/assets/icons";

import BoxIcon from "./BoxIcon";

const CustomAccordion = styled(Accordion)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.grey[300]} !important`,
  borderColor: theme.palette.grey[300],
  borderTopRightRadius: "8px",
  borderTopLeftRadius: "8px",
  borderBottomLeftRadius: "8px",
  borderBottomRightRadius: "8px",
}));

interface AccordionResourceItemProps extends PropsWithChildren {
  action?: React.ReactNode;
  icon: React.ReactNode;
  title: React.ReactNode;
  onRemove?: () => void;
}

const AccordionResourceItem: React.FC<AccordionResourceItemProps> = ({ title, icon, children, onRemove }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [open, setOpen] = useState(false);

  const handleOpenRemoveConfirmation = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleRemove = () => {
    onRemove?.();
    setOpen(false);
  };
  const toggleExpand = () => setIsExpanded((exp) => !exp);
  return (
    <>
      <CustomAccordion expanded={isExpanded}>
        <AccordionSummary expandIcon={<ChevronDownIcon className="cursor-pointer" onClick={toggleExpand} />}>
          <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={toggleExpand}>
            <BoxIcon>{icon}</BoxIcon>
            {title ? <Typography sx={{ fontWeight: 600 }}>{title}</Typography> : null}
          </div>
          <span className="w-6 h-6 inline-flex items-center justify-center my-auto mr-2">
            <TrashIcon1 className="w-4 h-4 hover:text-red-600" onClick={handleOpenRemoveConfirmation} />
          </span>
        </AccordionSummary>
        <AccordionDetails>{children}</AccordionDetails>
      </CustomAccordion>
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle id="alert-dialog-title">{`Xoá "${title}"`}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{`Bạn có chắc chắn muốn xoá "${title}"`}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined" color="inherit">
            Tiếp tục chỉnh sửa
          </Button>
          <Button onClick={handleRemove} color="error">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
export default AccordionResourceItem;
