import { EmployeeType } from "@/model/employee.model";
import { Profile } from "@/model/profile.model";

export type SignUpDto = {
  fullName: string;
  email: string;
  password: string;
  employeeType: Extract<EmployeeType, "student" | "teacher">;
};

export type SignUpDtoResponse = {
  userId: string;
  employeeId: string;
  organizationId: string;
  employeeCode: string;
  employeeOrder: number | null;
  employeeType: Extract<EmployeeType, "student" | "teacher">;
  account: {
    email: string;
  };
  profile: {
    fullName: string;
    gender: Profile["gender"];
    email: string;
  };
  status: "inactive" | "active";
};
