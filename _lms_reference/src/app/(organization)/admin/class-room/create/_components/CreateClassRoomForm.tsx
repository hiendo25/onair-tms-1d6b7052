"use client";
import React, { useRef } from "react";
import { useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";

import { ClassRoomPlatformType } from "@/constants/class-room.constant";
import { PATHS } from "@/constants/path.constant";
import { QUERY_KEYS } from "@/constants/query-key.constant";
import { ClassRoomType } from "@/model/class-room.model";
import ManageClassRoomForm, {
  ManageClassRoomFormProps,
  ManageClassRoomFormRef,
} from "@/modules/class-room-management/components/ManageClassRoomForm";
import { useCreateClassRoomMutation } from "@/modules/class-room-management/operations/mutation";
interface CreateClassRoomFormProps {
  platform: ClassRoomPlatformType;
  roomType: ClassRoomType;
  isLearningPath?: boolean;
}
const CreateClassRoomForm: React.FC<CreateClassRoomFormProps> = ({ platform, roomType, isLearningPath }) => {
  const [isTransition, startTransition] = useTransition();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const router = useRouter();
  const formClassRoomRef = useRef<ManageClassRoomFormRef>(null);
  // const { onCreate, isLoading } = useCRUDClassRoom();
  const { mutate: onCreate, isPending: isLoading } = useCreateClassRoomMutation();
  const handleCancel = () => {
    router.push(PATHS.CLASSROOMS.ROOT);
  };

  const handleCreateClassRoom: ManageClassRoomFormProps["onSubmit"] = (formData, students, certificate) => {
    onCreate(
      { formData, students, certificate },
      {
        onSuccess(data, variables, onMutateResult, context) {
          startTransition(() => {
            enqueueSnackbar("Tạo lớp học thành công", { variant: "success" });
            router.push(PATHS.CLASSROOMS.LIST_CLASSROOM);
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_CLASS_ROOMS] });
          });
        },
      },
    );
  };
  return (
    <ManageClassRoomForm
      onSubmit={handleCreateClassRoom}
      onCancel={handleCancel}
      platform={platform}
      roomType={roomType}
      isLearningPath={isLearningPath}
      ref={formClassRoomRef}
      isLoading={isLoading || isTransition}
    />
  );
};
export default CreateClassRoomForm;
