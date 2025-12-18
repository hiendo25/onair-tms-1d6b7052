import { StoreApi } from "zustand";

import { ClassRoomStore, StudentSelectedItem, TeacherSelectedItem } from "./class-room-store";

export type ClassRoomActions = {
  reset: () => void;
  setSelectedTeachers: (sessionIndex: number, teachers: TeacherSelectedItem[]) => void;
  getTeachersByIndexSession: (sessionIndex: number) => TeacherSelectedItem[] | undefined;
  removeTeacher: (id: string, sessionIndex: number) => void;
  removeTeachers: (sessionIndex: number) => void;
  setSelectedStudents: (students: StudentSelectedItem[]) => void;
};

const attachActions =
  (initState: ClassRoomStore["state"]) =>
  (
    set: StoreApi<ClassRoomStore>["setState"],
    get: StoreApi<ClassRoomStore>["getState"],
    store: StoreApi<ClassRoomStore>,
  ): ClassRoomActions => ({
    setSelectedTeachers: (sessionIndex, teachers) =>
      set((prev) => ({
        ...prev,
        state: {
          ...prev.state,
          selectedTeachers: {
            ...prev.state.selectedTeachers,
            [sessionIndex]: [...(prev.state.selectedTeachers[sessionIndex] || []), ...teachers],
          },
        },
      })),
    removeTeachers: (sessionIndex) => {
      set((prev) => {
        const newSelectedTeachers = { ...prev.state.selectedTeachers };
        delete newSelectedTeachers[sessionIndex];

        /**
         * Resort Index session
         */
        let newSelectedTeachersResortByIndex: typeof newSelectedTeachers = {};
        Object.entries(newSelectedTeachers).forEach(([key, value], _index) => {
          newSelectedTeachersResortByIndex = {
            ...newSelectedTeachersResortByIndex,
            [_index]: value,
          };
        });
        return {
          ...prev,
          state: {
            ...prev.state,
            selectedTeachers: {
              ...newSelectedTeachersResortByIndex,
            },
          },
        };
      });
    },
    removeTeacher: (id, sessionIndex) => {
      set((prev) => {
        const currentTeacherList = prev.state.selectedTeachers[sessionIndex];
        const newListTeacher = currentTeacherList?.filter((tc) => tc.id !== id);
        return {
          ...prev,
          state: {
            ...prev.state,
            selectedTeachers: {
              ...prev.state.selectedTeachers,
              [sessionIndex]: newListTeacher ? [...newListTeacher] : [],
            },
          },
        };
      });
    },
    getTeachersByIndexSession: (sessionIndex: number) => {
      const {
        state: { selectedTeachers },
      } = get();
      return selectedTeachers[sessionIndex];
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
