import attachActions from "./upsert-course-actions";
import { createStore } from "zustand/vanilla";
import { ClassRoomActions } from "./upsert-course-actions";
import { EmployeeType } from "@/model/employee.model";

export type TeacherSelectedItem = {
  id: string;
  fullName: string;
  email: string;
  employeeCode: string;
  avatar: string | null;
  empoyeeType: Exclude<EmployeeType, "admin" | "student">;
};
export type StudentSelectedItem = {
  id: string;
  fullName: string;
  email: string;
  employeeCode: string;
  avatar: string | null;
  empoyeeType: Exclude<EmployeeType, "admin" | "teacher">;
};

type UpsertCourseState = {
  selectedTeachers: TeacherSelectedItem[];
  selectedStudents: StudentSelectedItem[];
};

type UpsertCourseStore = {
  state: UpsertCourseState;
  actions: ClassRoomActions;
};

const createUpsertCourseStore = (initState: UpsertCourseState) => {
  return createStore<UpsertCourseStore>()((set, get, store) => ({
    state: { ...initState },
    actions: {
      ...attachActions(initState)(set, get, store),
    },
  }));
};
export { createUpsertCourseStore };
export type { UpsertCourseStore, ClassRoomActions, UpsertCourseState };
