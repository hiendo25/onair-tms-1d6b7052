import { Gender, Profile } from "@/model/profile.model";
export interface ProfileInsert extends Pick<
  Profile,
  "employee_id" | "email" | "full_name" | "gender" | "phone_number" | "avatar" | "birthday"
> {}
