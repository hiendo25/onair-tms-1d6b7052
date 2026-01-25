"use client";
import React, { memo } from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { enqueueSnackbar } from "notistack";

import { PATHS } from "@/constants/path.constant";
import { useUserOrganization } from "@/modules/organization";
import UpsertLevelForm, { UpsertLevelFormProps } from "../components/UpsertLevelForm";
import { useCreateLevelMutation } from "../operations/mutations";
import { CreateLevelPayload } from "../type";

function CreateLevelForm() {
  const router = useRouter();
  const [isTransition, startTransition] = useTransition();

  const { id: employeeId } = useUserOrganization((state) => state.currentEmployee);
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
          router.push(PATHS.GAMIFICATIONS.ROOT);
        });
      },
    });
  };

  const handleCancel: UpsertLevelFormProps["onCancel"] = () => {
    startTransition(() => {
      router.push(PATHS.GAMIFICATIONS.ROOT);
    });
  };
  return <UpsertLevelForm onCancel={handleCancel} onSubmit={handleCreateLevel} isLoading={isPending || isTransition} />;
}

export default memo(CreateLevelForm);
