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
import UpsertBranchForm, { UpsertBranchFormProps, UpsertBranchFormRef } from "../components/UpsertBranchForm";
import { useCreateBranchMutation } from "../operations/mutation";
import { CreateBranchPayload } from "../type";
export interface CreateBranchDrawerRef {
  open: () => void;
  close: () => void;
}
export interface CreateBranchDrawerProps {
  open?: boolean;
}
const CreateBranchDrawer = React.forwardRef<CreateBranchDrawerRef, CreateBranchDrawerProps>(({ open = false }, ref) => {
  const upsertFormRef = useRef<UpsertBranchFormRef>(null);
  const [openDrawer, setOpenDrawer] = useState(open);

  const [isTransition, startTransition] = useTransition();
  const queryClient = useQueryClient();

  const { mutate: createBranch, isPending } = useCreateBranchMutation();

  const handleCreateLevel: UpsertBranchFormProps["onSubmit"] = (formData) => {
    const createBranchPayload: CreateBranchPayload = {
      address: formData.address,
      code: formData.code,
      name: formData.name,
      managedById: formData.managedById,
    };

    createBranch(createBranchPayload, {
      onSuccess(data, variables, onMutateResult, context) {
        startTransition(() => {
          enqueueSnackbar("Tạo chi nhánh thành công.", { variant: "success" });
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
    open: () => {
      setOpenDrawer(true);
    },
    close: () => {
      setOpenDrawer(false);
    },
  }));

  return (
    <Drawer anchor="right" open={openDrawer}>
      <div className="flex flex-col overflow-hidden h-screen w-[450px]">
        <Toolbar className="border-b border-gray-200 z-10 bg-white">
          <Typography variant="h6">Tạo chi nhánh</Typography>
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
export default memo(CreateBranchDrawer);
