"use client";
import React, { memo, useImperativeHandle, useState, useTransition } from "react";
import { useRef } from "react";
import { Box, Button, Drawer, IconButton, Toolbar, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";

import { QUERY_KEYS } from "@/constants/query-key.constant";
import { CloseIcon } from "@/shared/assets/icons";
import UpsertBranchForm, { UpsertBranchFormProps, UpsertBranchFormRef } from "../components/UpsertBranchForm";
import { useUpdateBranchMutation } from "../operations/mutation";
import { UpdateBranchPayload } from "../type";
export interface UpdateBranchDrawerRef {
  open: (data: UpsertBranchFormProps["initialValues"]) => void;
  close: () => void;
}
export interface UpdateBranchDrawerProps {
  open?: boolean;
}
const UpdateBranchDrawer = React.forwardRef<UpdateBranchDrawerRef, UpdateBranchDrawerProps>(({ open = false }, ref) => {
  const upsertFormRef = useRef<UpsertBranchFormRef>(null);
  const [openDrawer, setOpenDrawer] = useState(open);
  const [initialValues, setInitialValues] = useState<UpsertBranchFormProps["initialValues"]>(undefined);

  const [isTransition, startTransition] = useTransition();
  const queryClient = useQueryClient();

  const { mutate: updateBranch, isPending } = useUpdateBranchMutation();

  const handleCreateLevel: UpsertBranchFormProps["onSubmit"] = (formData) => {
    console.log({ formData });
    const updateBranchPayload: UpdateBranchPayload = {
      id: formData.id,
      address: formData.address,
      code: formData.code,
      name: formData.name,
      parentId: formData.parentId,
      managedById: formData.managedById,
    };

    updateBranch(updateBranchPayload, {
      onSuccess(data, variables, onMutateResult, context) {
        startTransition(() => {
          enqueueSnackbar("Cập nhật chi nhánh thành công.", { variant: "success" });
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_BRANCHES] });
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
    open: (formValues) => {
      setInitialValues(formValues);
      setOpenDrawer(true);
    },
    close: () => {
      setOpenDrawer(false);
      setInitialValues(undefined);
    },
  }));

  return (
    <Drawer anchor="right" open={openDrawer}>
      <div className="flex flex-col overflow-hidden h-screen w-[450px]">
        <Toolbar className="border-b border-gray-200 z-10 bg-white">
          <Typography variant="h6">Cập nhật chi nhánh</Typography>
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
          <UpsertBranchForm
            ref={upsertFormRef}
            isLoading={isPending || isTransition}
            onSubmit={handleCreateLevel}
            onCancel={handleCloseDrawer}
            initialValues={initialValues}
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
});
export default memo(UpdateBranchDrawer);
