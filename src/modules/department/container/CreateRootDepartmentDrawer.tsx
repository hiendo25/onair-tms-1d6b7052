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
import UpsertRootDepartmentForm, {
  UpsertDepartmentFormProps,
  UpsertDepartmentFormRef,
} from "../components/UpsertRootDepartmentForm";
import { useCreateDepartmentMutation } from "../operations/mutation";
import { CreateRootDepartmentPayload } from "../type";
export interface CreateRootDepartmentDrawerRef {
  open: () => void;
  close: () => void;
}
export interface CreateRootDepartmentDrawerProps {
  open?: boolean;
}
const CreateRootDepartmentDrawer = React.forwardRef<CreateRootDepartmentDrawerRef, CreateRootDepartmentDrawerProps>(
  ({ open = false }, ref) => {
    const queryClient = useQueryClient();

    const upsertFormRef = useRef<UpsertDepartmentFormRef>(null);
    const [openDrawer, setOpenDrawer] = useState(open);
    const [isTransition, startTransition] = useTransition();

    const { mutate: createDepartment, isPending } = useCreateDepartmentMutation({ isRoot: true });

    const handleCreateLevel: UpsertDepartmentFormProps["onSubmit"] = (formData) => {
      const createDepartmentPayload: CreateRootDepartmentPayload = {
        branchId: formData.branchId,
        code: formData.code,
        name: formData.name,
        managedById: formData.managedById,
        type: "root",
      };

      createDepartment(createDepartmentPayload, {
        onSuccess(data, variables, onMutateResult, context) {
          startTransition(() => {
            enqueueSnackbar("Tạo phòng ban thành công.", { variant: "success" });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_DEPARTMENTS] });
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
            <Typography variant="h6">Tạo phòng ban</Typography>
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
export default memo(CreateRootDepartmentDrawer);
