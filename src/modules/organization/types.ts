import { EmployeeType } from "@/model/employee.model";
import { Gender } from "@/model/profile.model";
interface UserOrganization {
  id: string;
  status: "active" | "inactive";
  employeeCode: string;
  employeeType: EmployeeType;
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
  isMain: boolean;
  orgId: string;
  orgName: string;
  orgLogo: string;
  orgDomain: string;
  orgFavicon: string;
  orgShortName: string;
  userId: string;
};

export type { UserOrganization, EmployeeOrganization };
