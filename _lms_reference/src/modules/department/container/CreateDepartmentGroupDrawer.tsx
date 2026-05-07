"use client";
import React, { memo, useImperativeHandle, useState, useTransition } from "react";
import { useRef } from "react";
import { Box, Button, Drawer, IconButton, Toolbar, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { enqueueSnackbar } from "notistack";

import { QUERY_KEYS } from "@/constants/query-key.constant";
import { CloseIcon } from "@/shared/assets/icons";
import UpsertChildDepartmentForm, {
  UpsertChildDepartmentFormProps,
  UpsertChildDepartmentFormRef,
} from "../components/UpsertChildDepartmentForm";
import { useCreateDepartmentMutation } from "../operations/mutation";
import { CreateDepartmentGroupPayload, CreateDepartmentGroupResponse } from "../type";
export interface CreateDepartmentGroupDrawerRef {
  open: (
    departmentParentId: string,
    callbacks?: {
      onSuccess?: (data: NonNullable<CreateDepartmentGroupResponse["data"]>) => void;
      onError?: () => void;
    },
  ) => void;
  close: () => void;
}
export interface CreateDepartmentGroupDrawerProps {
  open?: boolean;
}
const CreateDepartmentGroupDrawer = React.forwardRef<CreateDepartmentGroupDrawerRef, CreateDepartmentGroupDrawerProps>(
  ({ open = false }, ref) => {
    const queryClient = useQueryClient();

    const upsertFormRef = useRef<UpsertChildDepartmentFormRef>(null);
    const [openDrawer, setOpenDrawer] = useState(open);
    const [isTransition, startTransition] = useTransition();

    const [departmentParentId, setDepartmentParentId] = useState<string>();
    const { mutate: createDepartment, isPending } = useCreateDepartmentMutation({ isRoot: false });
    const [onError, setOnError] = useState<() => void>();
    const [onSuccess, setOnSuccess] = useState<(data: NonNullable<CreateDepartmentGroupResponse["data"]>) => void>();

    const handleCreateLevel: UpsertChildDepartmentFormProps["onSubmit"] = (formData) => {
      const createDepartmentPayload: CreateDepartmentGroupPayload = {
        parentId: departmentParentId,
        code: formData.code,
        name: formData.name,
        managedById: formData.managedById,
        type: "group",
      };

      createDepartment(createDepartmentPayload, {
        onSuccess(data, variables, onMutateResult, context) {
          startTransition(() => {
            enqueueSnackbar("Tạo nhóm thành công.", { variant: "success" });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_DEPARTMENT_GROUPS] });
            setOpenDrawer(false);
            onSuccess?.(data);
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
      open: (departmentParentId: string, callbacks) => {
        setOpenDrawer(true);
        setDepartmentParentId(departmentParentId);
        if (callbacks?.onSuccess) setOnSuccess(() => callbacks?.onSuccess);
        if (callbacks?.onError) setOnError(() => callbacks?.onError);
      },
      close: () => {
        setOpenDrawer(false);
      },
    }));

    return (
      <Drawer anchor="right" open={openDrawer}>
        <div className="flex flex-col overflow-hidden h-screen w-[450px]">
          <Toolbar className="border-b border-gray-200 z-10 bg-white">
            <Typography variant="h6">Tạo nhóm</Typography>
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
            <UpsertChildDepartmentForm
              ref={upsertFormRef}
              isLoading={isPending || isTransition}
              onSubmit={handleCreateLevel}
              onCancel={handleCloseDrawer}
              hideButtonCancel
              hideButtonSubmit
            />
          </Box>
          <Toolbar className="gap-2 border-t border-gray-200">
            <Button
              variant="outlined"
              className="w-24"
              onClick={handleTriggerCancelForm}
              disabled={isPending || isTransition}
            >
              Hủy bỏ
            </Button>
            <Button className="w-24" onClick={handleTriggerSubmitForm} disabled={isPending || isTransition}>
              Lưu
            </Button>
          </Toolbar>
        </div>
      </Drawer>
    );
  },
);
export default memo(CreateDepartmentGroupDrawer);
