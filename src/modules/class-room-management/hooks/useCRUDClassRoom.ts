"use client";
import { QueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constants/query-key.constant";
import { useTMutation } from "@/lib";
import { useUserOrganization } from "@/modules/organization/store/OrganizationProvider";
import { UpsertClassRoomService } from "@/services/class-room/upsert-class-room.service";
import { ClassRoom } from "../components/ManageClassRoomForm/classroom-form.schema";
import { ClassRoomStore } from "../store/class-room-store";

const useCRUDClassRoom = () => {
  const currentEmployee = useUserOrganization((state) => state.currentEmployee);
  const queryClient = new QueryClient();
  const classRoomService = new UpsertClassRoomService(currentEmployee.id, currentEmployee.organization.id);

  const { mutate: doCreateClassRoom, isPending } = useTMutation({
    mutationKey: ["CREATE_CLASS_ROOM"],
    mutationFn: async (payload: { formData: ClassRoom; students: ClassRoomStore["state"]["selectedStudents"] }) => {
      const { formData, students } = payload;
      return await classRoomService.create({ formData, students });
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_CLASS_ROOMS] });
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
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_CLASS_ROOMS] });
    },
  });

  return {
    onCreate: doCreateClassRoom,
    onUpdate: doUpdateClassRoom,
    isLoading: isPending || isPendingUpdate,
  };
};
export { useCRUDClassRoom };
