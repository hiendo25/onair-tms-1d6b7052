import PageContainer from "@/shared/ui/PageContainer";
import DashboardSection from "./_components";

const DashboardPage = () => {
    return (
        <PageContainer
            title="Dashboard"
            breadcrumbs={[
                { title: "Dashboard", path: "/dashboard" }
            ]}
        >
            <DashboardSection />
        </PageContainer>
    );
}

export default DashboardPage;