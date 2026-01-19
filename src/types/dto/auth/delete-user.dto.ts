import { EmployeeType } from "@/model/employee.model";
import { Profile } from "@/model/profile.model";

export type DeleteUserDto = {
  userId: string;
  employeeId: string;
};

export type DeleteUserDtoResponse = {
  userId: string;
  employeeId: string;
  employeeCode: string;
  profile: {
    fullName: string;
    email: string;
  };
};
