import { Tables } from "@/types/supabase.types";

export type Departments = Tables<"departments">;

export type DepartmentStatus = Departments["status"];
