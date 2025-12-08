import { Database, Tables } from "@/types/supabase.types";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
export type Employee = Tables<"employees">;
export type EmployeeType = Database["public"]["Enums"]["employee_type"];
export type EmployeeStudentWithProfileItem = {
  id: string;
  employee_code: string;
  status: "active" | "inactive";
  employee_type: "student";
  profiles: {
    id: string;
    full_name: string;
    gender: "male" | "female" | "other";
    avatar: string | null;
    email: string;
  };
  employments: {
    organization_units: {
      id: string;
      name: string;
      type: string;
    };
  }[];
};

export type EmployeeTeacherTypeItem = {
  id: string;
  employee_code: string;
  employee_type: "teacher";
  status: "active" | "inactive";
  profiles: {
    id: string;
    full_name: string;
    gender: "male" | "female" | "other";
    avatar: string | null;
    email: string;
  };
  employments: {
    organization_units: {
      id: string;
      name: string;
      type: string;
      parent_id: string;
      branch: {
        id: string;
        name: string;
        type: string;
      };
    };
  }[];
};

export type EmployeeWithOrganizationItem = {
  id: string;
  employee_code: string;
  employee_type: "teacher";
  status: "active" | "inactive";
  profiles: {
    id: string;
    full_name: string;
    gender: "male" | "female" | "other";
    avatar: string | null;
    email: string;
  };
  employments: {
    organization_units: {
      id: string;
      name: string;
      type: string;
    };
  }[];
};
export type EmployeeWithProfileListResponse = PostgrestSingleResponse<EmployeeStudentWithProfileItem[]>;
export type EmployeeTeacherTypeListResponse = PostgrestSingleResponse<EmployeeTeacherTypeItem[]>;
