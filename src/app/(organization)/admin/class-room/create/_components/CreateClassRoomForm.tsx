"use client";
import { ClassRoomPlatformType } from "@/constants/class-room.constant";
import { ClassRoomType } from "@/model/class-room.model";
import ManageClassRoomForm, {
  ManageClassRoomFormProps,
  ManageClassRoomFormRef,
} from "@/modules/class-room-management/components/ManageClassRoomForm";
import { useCRUDClassRoom } from "@/modules/class-room-management/hooks/useCRUDClassRoom";
import { useSnackbar } from "notistack";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useTransition } from "react";
import { PATHS } from "@/constants/path.contstants";
interface CreateClassRoomFormProps {
  platform: ClassRoomPlatformType;
  roomType: ClassRoomType;
}
const CreateClassRoomForm: React.FC<CreateClassRoomFormProps> = ({ platform, roomType }) => {
  const [isTransition, startTransition] = useTransition();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const formClassRoomRef = useRef<ManageClassRoomFormRef>(null);
  const { onCreate, isLoading } = useCRUDClassRoom();
  const handleCancel = () => {
    router.push(PATHS.CLASSROOMS.ROOT);
  };

  const handleCreateClassRoom: ManageClassRoomFormProps["onSubmit"] = (formData, students) => {
    onCreate(
      { formData, students },
      {
        onSuccess(data, variables, onMutateResult, context) {
          startTransition(() => {
            enqueueSnackbar("Tạo lớp học thành công", { variant: "success" });
            router.push(PATHS.CLASSROOMS.ROOT);
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
      ref={formClassRoomRef}
      isLoading={isLoading || isTransition}
    />
  );
};
export default CreateClassRoomForm;
