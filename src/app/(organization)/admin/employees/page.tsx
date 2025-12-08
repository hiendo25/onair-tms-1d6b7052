import EmployeeList from "@/app/(organization)/admin/employees/_components/EmployeeList";
import { Database } from "@/types/supabase.types";

type EmployeePageProps = {
  searchParams: Promise<{
    employee_type?: Database["public"]["Enums"]["employee_type"];
  }>;
};

const EmployeePage = async ({ searchParams }: EmployeePageProps) => {
  const params = await searchParams;
  const employeeType = params.employee_type || "student";

  return <EmployeeList employeeType={employeeType} />;
};
export default EmployeePage;
