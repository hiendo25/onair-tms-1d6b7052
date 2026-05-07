import { EmployeeType } from "@/model/employee.model";
import { Gender } from "@/model/profile.model";
interface UserOrganization {
  id: string;
  status: "active" | "inactive";
  employeeCode: string;
  employeeType: EmployeeType;
  employeeId: string;
  userId: string;
  organization: {
    id: string;
    name: string;
    subdomain: string;
  };
  profile: {
    fullName?: string;
    avatarUrl?: string;
    email?: string;
    gender: Gender;
  } | null;
}

type EmployeeOrganization = {
  employeeId: string;
  orgId: string;
  orgName: string;
  orgLogo: string;
  orgDomain: string;
  orgFavicon: string;
  orgShortName: string;
  userId: string;
};

type Employee = {
  id: string;
  status: "active" | "inactive";
  code: string;
  type: EmployeeType;
  userId: string;
  organization: {
    id: string;
    name: string;
  };
  profile: {
    fullName?: string;
    avatarUrl?: string;
    email?: string;
    gender: Gender;
  } | null;
};

export type { UserOrganization, EmployeeOrganization, Employee };
