import { StoreApi } from "zustand";
import { UpsertCourseStore, StudentSelectedItem, TeacherSelectedItem } from "./upsert-course-store";

export type ClassRoomActions = {
  reset: () => void;
  setSelectedTeachers: (teachers: TeacherSelectedItem[]) => void;
  removeTeacher: (id: string) => void;
  resetTeachers: () => void;
  setSelectedStudents: (students: StudentSelectedItem[]) => void;
};

const attachActions =
  (initState: UpsertCourseStore["state"]) =>
  (
    set: StoreApi<UpsertCourseStore>["setState"],
    get: StoreApi<UpsertCourseStore>["getState"],
    store: StoreApi<UpsertCourseStore>,
  ): ClassRoomActions => ({
    setSelectedTeachers: (teachers) =>
      set((prev) => ({
        ...prev,
        state: {
          ...prev.state,
          selectedTeachers: [...prev.state.selectedTeachers, ...teachers],
        },
      })),
    resetTeachers: () => {
      set((prev) => {
        return {
          ...prev,
          state: {
            ...prev.state,
            selectedTeachers: [],
          },
        };
      });
    },
    removeTeacher: (id) => {
      set((prev) => {
        const currentTeacherList = prev.state.selectedTeachers;
        const newListTeacher = currentTeacherList.filter((tc) => tc.id !== id);
        return {
          ...prev,
          state: {
            ...prev.state,
            selectedTeachers: [...newListTeacher],
          },
        };
      });
    },
    setSelectedStudents: (students) => {
      set((prevState) => ({
        ...prevState,
        state: {
          ...prevState.state,
          selectedStudents: students,
        },
      }));
    },
    reset: () => {
      set(store.getInitialState());
    },
  });
export default attachActions;
