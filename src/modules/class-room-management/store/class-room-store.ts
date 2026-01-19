import { createStore } from "zustand/vanilla";

import { EmployeeType } from "@/model/employee.model";

import attachActions from "./class-room-actions";
import { ClassRoomActions } from "./class-room-actions";

export type TeacherSelectedItem = {
  id: string;
  fullName: string;
  email: string;
  employeeCode: string;
  avatar: string | null;
  employeeType: Exclude<EmployeeType, "admin" | "student">;
};
export type StudentSelectedItem = {
  id: string;
  fullName: string;
  email: string;
  employeeCode: string;
  avatar: string | null;
  employeeType: Exclude<EmployeeType, "admin" | "teacher">;
};

export type CertificateSelectedItem = {
  id: string;
  name: string;
  frameUrl: string | null;
};

type ClassRoomState = {
  selectedTeachers: {
    [sessionIndex: number | string]: TeacherSelectedItem[];
  };
  selectedStudents: StudentSelectedItem[];
  selectedCertificate: CertificateSelectedItem | null;
};

type ClassRoomStore = {
  state: ClassRoomState;
  actions: ClassRoomActions;
};

const createClassRoomStore = (initState: ClassRoomState) => {
  return createStore<ClassRoomStore>()((set, get, store) => ({
    state: { ...initState },
    actions: {
      ...attachActions(initState)(set, get, store),
    },
  }));
};
export { createClassRoomStore };
export type { ClassRoomStore, ClassRoomActions, ClassRoomState };
