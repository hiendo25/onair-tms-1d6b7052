import { User } from "@supabase/supabase-js";

import { EmployeeType } from "@/model/employee.model";
import { Profile } from "@/model/profile.model";

export type SignInDto = {
  email: string;
  password: string;
};
export type SignInDtoResponse = User;
