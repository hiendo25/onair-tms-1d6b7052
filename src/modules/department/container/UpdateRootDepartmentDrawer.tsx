"use client";
import React, { memo, useImperativeHandle, useState, useTransition } from "react";
import { useRef } from "react";
import { Box, Button, Drawer, IconButton, Toolbar, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";

import { QUERY_KEYS } from "@/constants/query-key.constant";
import { CloseIcon } from "@/shared/assets/icons";
import UpsertRootDepartmentForm, {
  UpsertDepartmentFormProps,
  UpsertDepartmentFormRef,
} from "../components/UpsertRootDepartmentForm";
import { useUpdateDepartmentMutation } from "../operations/mutation";
import { UpdateDepartmentResponse, UpdateRootDepartmentPayload } from "../type";

export interface UpdateRootDepartmentDrawerRef {
  open: (
    data: UpsertDepartmentFormProps["initialValues"],
    callbacks?: { onSuccess?: (data: NonNullable<UpdateDepartmentResponse["data"]>) => void; onError?: () => void },
  ) => void;
  close: () => void;
}
export interface UpdateRootDepartmentDrawerProps {
  open?: boolean;
}
const UpdateRootDepartmentDrawer = React.forwardRef<UpdateRootDepartmentDrawerRef, UpdateRootDepartmentDrawerProps>(
  ({ open = false }, ref) => {
    const upsertFormRef = useRef<UpsertDepartmentFormRef>(null);
    const [openDrawer, setOpenDrawer] = useState(open);

    const [initialValues, setInitialValues] = useState<UpsertDepartmentFormProps["initialValues"]>(undefined);
    const [onError, setOnError] = useState<() => void>();
    const [onSuccess, setOnSuccess] = useState<(data: NonNullable<UpdateDepartmentResponse["data"]>) => void>();

    const [isTransition, startTransition] = useTransition();
    const queryClient = useQueryClient();

    const { mutate: updateDepartment, isPending } = useUpdateDepartmentMutation({ isRoot: true });

    const handleUpdateDepartment: UpsertDepartmentFormProps["onSubmit"] = (formData) => {
      const updatePayload: UpdateRootDepartmentPayload = {
        id: formData.id,
        code: formData.code,
        name: formData.name,
        managedById: formData.managedById,
        branchId: formData.branchId,
        type: "root",
      };

      updateDepartment(updatePayload, {
        onSuccess(data, variables, onMutateResult, context) {
          startTransition(() => {
            enqueueSnackbar("Cập nhật phòng ban thành công.", { variant: "success" });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_DEPARTMENTS] });
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
      open: (formValues, callbacks) => {
        setInitialValues(formValues);

        if (callbacks?.onSuccess) setOnSuccess(() => callbacks.onSuccess);
        if (callbacks?.onError) setOnError(() => callbacks.onError);

        setOpenDrawer(true);
      },
      close: () => {
        setOpenDrawer(false);
        setOnSuccess(undefined);
        setOnError(undefined);
        setInitialValues(undefined);
      },
    }));

    return (
      <Drawer anchor="right" open={openDrawer}>
        <div className="flex flex-col overflow-hidden h-screen w-[450px]">
          <Toolbar className="border-b border-gray-200 z-10 bg-white">
            <Typography variant="h6">Cập nhật phòng ban</Typography>
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
            <UpsertRootDepartmentForm
              ref={upsertFormRef}
              isLoading={isPending || isTransition}
              onSubmit={handleUpdateDepartment}
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
  },
);
export default memo(UpdateRootDepartmentDrawer);
