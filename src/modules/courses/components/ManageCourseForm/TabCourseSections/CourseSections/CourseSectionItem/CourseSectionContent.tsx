import React, { PropsWithChildren, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";

import { Accordion, AccordionSummary, AccordionDetails } from "./CourseSectionAccordion";
import { ChevronDownIcon, Edit05Icon, Trash01Icon } from "@/shared/assets/icons";

interface CourseSectionContentProps extends PropsWithChildren {
  header?: React.ReactNode;
  label?: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
}
const CourseSectionContent: React.FC<CourseSectionContentProps> = ({ children, header, label, onEdit, onDelete }) => {
  const [isOpenDialog, setIsOpenDialog] = useState(false);

  const [expanded, setExpanded] = React.useState<boolean>(true);

  const handleChange = () => {
    setExpanded((prev) => !prev);
  };

  const openDialogConfirmDelete = () => {
    setIsOpenDialog(true);
  };

  const closeDialogConfirmDelete = () => {
    setIsOpenDialog(false);
  };
  return (
    <>
      <Accordion expanded={expanded}>
        <AccordionSummary component="div" onToggleExpand={handleChange} expandIcon={null}>
          <Box component="div" className="flex gap-2 flex-1">
            <div className="section-item__top-middle flex-1">{header}</div>
            <div className="section-item__top-right flex flex-col">
              <IconButton className="w-fit h-fit bg-transparent p-1" disableRipple>
                <ChevronDownIcon className="w-4 h-4" onClick={handleChange} />
              </IconButton>
              {onEdit && (
                <IconButton className="w-fit h-fit bg-transparent p-1" disableRipple onClick={onEdit}>
                  <Edit05Icon className="w-4 h-4" />
                </IconButton>
              )}
              {onDelete && (
                <IconButton className="w-fit h-fit bg-transparent p-1" disableRipple onClick={openDialogConfirmDelete}>
                  <Trash01Icon className="w-4 h-4" />
                </IconButton>
              )}
            </div>
          </Box>
        </AccordionSummary>
        <AccordionDetails>{children}</AccordionDetails>
      </Accordion>
      {onDelete ? (
        <Dialog
          open={isOpenDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle id="alert-dialog-title" className="break-all">
            Xoá học phần
          </DialogTitle>
          <div className="w-full h-px bg-gray-200"></div>
          <DialogContent className="flex flex-col gap-2">
            <Typography sx={{ fontSize: "0.875rem" }}>
              Xoá học phần <strong className="font-bold">{`"${label}"`}</strong> toàn bộ bài giảng bên trong sẽ bị xoá
              và không thể khôi phục.
            </Typography>
            <Typography sx={{ fontSize: "0.875rem" }} variant="body2">
              Bạn có chắc chắn muốn tiếp tục không?
            </Typography>
          </DialogContent>
          <div className="w-full h-px bg-gray-200"></div>
          <DialogActions>
            <Button onClick={closeDialogConfirmDelete} variant="outlined" color="inherit">
              Huỷ
            </Button>
            <Button onClick={onDelete} color="error">
              Xoá học phần
            </Button>
          </DialogActions>
        </Dialog>
      ) : null}
    </>
  );
};
export default CourseSectionContent;
