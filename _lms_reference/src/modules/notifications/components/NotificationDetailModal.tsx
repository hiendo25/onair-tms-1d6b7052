import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Box, Modal, Typography } from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

type ModalContent = {
  title: string;
  description: React.ReactNode;
  thumbnailUrl: string | null;
};
export interface NotificationDetailModalRef {
  open: (data?: ModalContent) => void;
}
export interface NotificationDetailModalProps {}
const NotificationDetailModal = forwardRef<NotificationDetailModalRef, NotificationDetailModalProps>((props, ref) => {
  const [openModal, setOpenModal] = useState(false);
  const [modalContent, setModalContent] = useState<ModalContent>({
    title: "",
    description: "",
    thumbnailUrl: null,
  });

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  useImperativeHandle(ref, () => ({
    open: (data) => {
      setOpenModal(true);
      if (data) {
        setModalContent(data);
      }
    },
  }));
  return (
    <Modal
      open={openModal}
      onClose={handleCloseModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      keepMounted
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          {modalContent.title}
        </Typography>
        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
          Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
        </Typography>
      </Box>
    </Modal>
  );
});
export default NotificationDetailModal;
