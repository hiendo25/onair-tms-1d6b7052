import EmployeeList from "@/app/(organization)/admin/employees/_components/EmployeeList";
import PageContainer from "@/shared/ui/PageContainer";
import { Database } from "@/types/supabase.types";

type EmployeePageProps = {
  searchParams: Promise<{
    employee_type?: Database["public"]["Enums"]["employee_type"];
  }>;
};

const EmployeePage = async ({ searchParams }: EmployeePageProps) => {
  const params = await searchParams;
  const employeeType = params.employee_type || "student";

  const pageTitleName = {
    teacher: "Danh sách giảng viên",
    student: "Danh sách học viên",
    admin: "Danh sách nhân viên",
  };

  return (
    <PageContainer title={pageTitleName[employeeType]} breadcrumbs={[{ title: "Nhân viên", path: "/admin/employees" }]}>
      <EmployeeList employeeType={employeeType} />
    </PageContainer>
  );
};
export default EmployeePage;
