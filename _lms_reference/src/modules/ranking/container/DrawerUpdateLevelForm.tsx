"use client";
import React, { memo, useCallback, useImperativeHandle, useState, useTransition } from "react";
import { useRef } from "react";
import { Box, Button, Drawer, IconButton, Toolbar, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";

import { QUERY_KEYS } from "@/constants/query-key.constant";
import { CloseIcon } from "@/shared/assets/icons";
import UpsertLevelForm, { UpsertLevelFormProps, UpsertLevelFormRef } from "../components/UpsertLevelForm";
import { useUpdateLevelMutation } from "../operations/mutations";
import { UpdateLevelPayload } from "../type";

export interface DrawerUpdateLevelFormRef {
  open: (data: UpsertLevelFormProps["initialValues"]) => void;
  close: () => void;
}
export interface DrawerUpdateLevelFormProps {
  open?: boolean;
}
const DrawerUpdateLevelForm = React.forwardRef<DrawerUpdateLevelFormRef, DrawerUpdateLevelFormProps>(
  ({ open = false }, ref) => {
    const upsertFormRef = useRef<UpsertLevelFormRef>(null);
    const [initialFormValues, setInitialFormValues] = useState<UpsertLevelFormProps["initialValues"]>();
    const queryClient = useQueryClient();
    const [openDrawer, setOpenDrawer] = useState(open);

    const [isTransition, startTransition] = useTransition();

    const { mutate: updateLevel, isPending } = useUpdateLevelMutation();

    const handleUpdateLevel: UpsertLevelFormProps["onSubmit"] = (formData) => {
      if (!formData.id) return;

      const updateLevelPayload: UpdateLevelPayload = {
        id: formData.id,
        description: formData.description,
        icon: formData.icon,
        scoreRequired: formData.scoreRequired,
        title: formData.title,
      };

      updateLevel(updateLevelPayload, {
        onSuccess(data, variables, onMutateResult, context) {
          startTransition(() => {
            enqueueSnackbar("Cập nhật cấp độ", { variant: "success" });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_LEVELS] });
            setOpenDrawer(false);
          });
        },
      });
    };

    const handleCloseDrawer = useCallback(() => {
      setOpenDrawer(false);
    }, [setOpenDrawer]);

    const submitForm = () => {
      upsertFormRef.current?.triggerSubmit();
    };

    const handleCancelCreate = () => {
      upsertFormRef.current?.triggerCancel();
    };

    useImperativeHandle(ref, () => ({
      open: (formData) => {
        if (formData) setInitialFormValues(formData);
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
            <Typography variant="h6">Chỉnh sửa: {initialFormValues?.title}</Typography>
            <div className="flex-1"></div>
            <IconButton size="small" disableRipple className="p-0 bg-white hover:bg-white" onClick={handleCancelCreate}>
              <CloseIcon />
            </IconButton>
          </Toolbar>
          <Box sx={{ overflowY: "auto", scrollbarWidth: "thin" }} className="p-6 flex-1">
            <UpsertLevelForm
              initialValues={initialFormValues}
              ref={upsertFormRef}
              isLoading={isPending || isTransition}
              hideButtonCancel
              hideButtonSubmit
              onSubmit={handleUpdateLevel}
              onCancel={handleCloseDrawer}
            />
          </Box>
          <Toolbar className="gap-2 border-t border-gray-200">
            <Button variant="outlined" className="w-24" onClick={handleCancelCreate}>
              Hủy bỏ
            </Button>
            <Button className="w-24" onClick={submitForm}>
              Lưu
            </Button>
          </Toolbar>
        </div>
      </Drawer>
    );
  },
);
export default memo(DrawerUpdateLevelForm);
