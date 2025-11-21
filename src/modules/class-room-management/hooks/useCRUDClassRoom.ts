"use client";

import { enqueueSnackbar } from "notistack";
import { ClassRoom } from "../components/ManageClassRoomForm/classroom-form.schema";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";
import { useTMutation } from "@/lib";
import { ClassRoomStore } from "../store/class-room-store";
import { QueryClient } from "@tanstack/react-query";
import { UpsertClassRoomService } from "@/services/class-room/upsert-class-room.service";
import { QUERY_KEYS } from "@/constants/query-key.constant";

const useCRUDClassRoom = () => {
  const userInfo = useUserOrganization((state) => state.data);
  const queryClient = new QueryClient();
  const classRoomService = new UpsertClassRoomService(userInfo.id, userInfo.organization.id);

  const { mutate: doCreateClassRoom, isPending } = useTMutation({
    mutationKey: ["CREATE_CLASS_ROOM"],
    mutationFn: async (payload: { formData: ClassRoom; students: ClassRoomStore["state"]["selectedStudents"] }) => {
      const { formData, students } = payload;
      return await classRoomService.create({ formData, students });
    },
    onError: (error) => {
      enqueueSnackbar({ message: error.message, variant: "error" });
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_COURSES] });
    },
  });

  const { mutate: doUpdateClassRoom, isPending: isPendingUpdate } = useTMutation({
    mutationKey: ["UPDATE_CLASS_ROOM"],
    mutationFn: async (payload: {
      classRoomId: string;
      formData: ClassRoom;
      students: ClassRoomStore["state"]["selectedStudents"];
    }) => {
      const { formData, students, classRoomId } = payload;

      return await classRoomService.update(classRoomId, { formData, students });
    },
    onError: (error) => {
      enqueueSnackbar({ message: error.message, variant: "error" });
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_COURSES] });
    },
  });

  return {
    onCreate: doCreateClassRoom,
    onUpdate: doUpdateClassRoom,
    isLoading: isPending || isPendingUpdate,
  };
};
export { useCRUDClassRoom };
