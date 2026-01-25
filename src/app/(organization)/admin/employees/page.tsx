import EmployeeList from "@/app/(organization)/admin/employees/_components/EmployeeList";
import PageContainer from "@/shared/ui/PageContainer";

const EmployeePage = async () => {
  return (
    <PageContainer title="Danh sách người dùng" breadcrumbs={[{ title: "Nhân viên", path: "/admin/employees" }]}>
      <EmployeeList />
    </PageContainer>
  );
};
export default EmployeePage;
