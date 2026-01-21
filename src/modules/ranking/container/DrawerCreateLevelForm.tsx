"use client";
import React, { memo, useImperativeHandle, useState, useTransition } from "react";
import { useRef } from "react";
import { Box, Button, Drawer, IconButton, Toolbar, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { enqueueSnackbar } from "notistack";

import { QUERY_KEYS } from "@/constants/query-key.constant";
import { useUserOrganization } from "@/modules/organization";
import { CloseIcon } from "@/shared/assets/icons";
import UpsertLevelForm, { UpsertLevelFormProps, UpsertLevelFormRef } from "../components/UpsertLevelForm";
import { useCreateLevelMutation } from "../operations/mutations";
import { CreateLevelPayload } from "../type";

export interface DrawerCreateLevelFormRef {
  open: () => void;
  close: () => void;
}
export interface DrawerCreateLevelFormProps {
  open?: boolean;
}
const DrawerCreateLevelForm = React.forwardRef<DrawerCreateLevelFormRef, DrawerCreateLevelFormProps>(
  ({ open = false }, ref) => {
    const upsertFormRef = useRef<UpsertLevelFormRef>(null);
    const [openDrawer, setOpenDrawer] = useState(open);

    const router = useRouter();
    const [isTransition, startTransition] = useTransition();
    const queryClient = useQueryClient();
    const {
      id: employeeId,
      organization: { id: organizationId },
    } = useUserOrganization((state) => state.currentEmployee);
    const { mutate: createLevel, isPending } = useCreateLevelMutation();

    const handleCreateLevel: UpsertLevelFormProps["onSubmit"] = (formData) => {
      const createLevelPayload: CreateLevelPayload = {
        description: formData.description,
        icon: formData.icon,
        scoreRequired: formData.scoreRequired,
        authorId: employeeId,
        title: formData.title,
      };

      createLevel(createLevelPayload, {
        onSuccess(data, variables, onMutateResult, context) {
          startTransition(() => {
            enqueueSnackbar("Tạo cấp độ thành công.", { variant: "success" });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_LEVELS] });
            setOpenDrawer(false);
          });
        },
      });
    };
    const handleCloseDrawer = () => {
      setOpenDrawer(false);
    };
    const handleTriggerSubmitForm = () => {
      upsertFormRef.current?.triggerSubmit();
    };
    const handleTriggerCancelForm = () => {
      upsertFormRef.current?.triggerCancel();
    };
    useImperativeHandle(ref, () => ({
      open: () => {
        setOpenDrawer(true);
      },
      close: () => {
        setOpenDrawer(false);
      },
    }));

    return (
      <Drawer anchor="right" open={openDrawer}>
        <div className="flex flex-col overflow-hidden h-screen">
          <Toolbar className="border-b border-gray-200 z-10 bg-white">
            <Typography variant="h6">Thêm danh hiệu mới</Typography>
            <div className="flex-1"></div>
            <IconButton
              size="small"
              disableRipple
              className="p-0 bg-white hover:bg-white"
              onClick={handleTriggerCancelForm}
            >
              <CloseIcon />
            </IconButton>
          </Toolbar>
          <Box sx={{ overflowY: "auto", scrollbarWidth: "thin" }} className="p-6 flex-1">
            <UpsertLevelForm
              ref={upsertFormRef}
              isLoading={isPending || isTransition}
              onSubmit={handleCreateLevel}
              onCancel={handleCloseDrawer}
              hideButtonCancel
              hideButtonSubmit
            />
          </Box>

          <Toolbar className="gap-2 border-t border-gray-200">
            <Button variant="outlined" className="w-24" onClick={handleTriggerCancelForm}>
              Hủy bỏ
            </Button>
            <Button className="w-24" onClick={handleTriggerSubmitForm}>
              Lưu
            </Button>
          </Toolbar>
        </div>
      </Drawer>
    );
  },
);
export default memo(DrawerCreateLevelForm);
