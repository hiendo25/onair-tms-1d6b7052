import React, { useTransition } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { alpha, styled, Typography, TypographyProps } from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";

import { TrashIcon1 } from "@/shared/assets/icons";
import { cn } from "@/utils";
export interface AccordionSessionItemProps extends React.PropsWithChildren {
  index: number;
  title?: string;
  status?: "idle" | "valid" | "invalid";
  onRemove?: (index: number) => void;
}
const BoxNumberCount = styled((props: TypographyProps) => <Typography {...props} component="span" />)(() => ({
  width: "1.25rem",
  height: "1.25rem",
  background: "#7B61FF",
  display: "inline-flex",
  alignContent: "center",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "5px",
  fontWeight: "bold",
  color: "white",
  fontSize: "0.75rem",
}));

const AccordionSessionItem: React.FC<AccordionSessionItemProps> = ({
  index = 0,
  children,
  title,
  onRemove,
  status = "idle",
}) => {
  const [isTransition, startTransition] = useTransition();
  const [openDialog, setOpenDialog] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState<boolean>(true);
  const toggleExpand = () => setIsExpanded((prev) => !prev);
  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const handleConfirm = () => {
    startTransition(() => {
      setOpenDialog(false);
      onRemove?.(index);
    });
  };
  return (
    <div>
      <Accordion
        expanded={isExpanded}
        className={cn({
          invalid: status === "invalid",
          valid: status === "valid",
        })}
        sx={(theme) => ({
          padding: 0,
          "&.invalid": {
            borderColor: theme.palette.error["main"],
            backgroundColor: alpha(theme.palette.error["lighter"], 0.1),
          },
          "&.valid": {
            borderColor: theme.palette.primary["main"],
          },
        })}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon onClick={toggleExpand} />}
          className="felx items-center justify-between"
          sx={(theme) => ({
            backgroundColor: theme.palette.grey[200],
            borderRadius: 0,
            "& .MuiAccordionSummary-content": {
              marginBlock: "6px",
            },
            "&:hover": {
              backgroundColor: theme.palette.grey[200],
            },
          })}
        >
          <div className="flex items-center gap-3 flex-1" onClick={toggleExpand}>
            <BoxNumberCount>{index + 1}</BoxNumberCount>
            <Typography component="p" sx={{ fontWeight: 600 }} className="flex-1 line-clamp-1 break-all">
              {title ? title : `Lớp học ${index + 1}`}
            </Typography>
          </div>
          {onRemove ? (
            <span className="cursor-pointer w-8 h-8 inline-flex items-center justify-center" onClick={handleOpenDialog}>
              <TrashIcon1 className="w-4 h-4" />
            </span>
          ) : null}
        </AccordionSummary>
        <AccordionDetails>{children}</AccordionDetails>
      </Accordion>
      {onRemove ? (
        <Dialog
          open={openDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle id="alert-dialog-title" className="break-all">{`Xoá`}</DialogTitle>
          <DialogContent>
            <DialogContentText
              id="alert-dialog-description"
              className="break-all"
              sx={{ fontSize: "0.875rem" }}
            >{`Bạn có chắc chắn muốn xoá "${title}"`}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} variant="outlined" color="inherit" disabled={isTransition}>
              Tiếp tục chỉnh sửa
            </Button>
            <Button onClick={handleConfirm} color="error" loading={isTransition}>
              Xóa
            </Button>
          </DialogActions>
        </Dialog>
      ) : null}
    </div>
  );
};
export default React.memo(AccordionSessionItem);
