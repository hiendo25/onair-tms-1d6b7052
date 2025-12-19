import PageContainer from "@/shared/ui/PageContainer";

import MyClassSection from "./_components";

const MyClassPage = () => {
  return (
    <PageContainer
      title="Lớp học của tôi"
      breadcrumbs={[
        {
          title: "LMS",
          path: "/dashboard",
        },
        {
          title: "Lớp học của tôi",
        },
      ]}
    >
      <MyClassSection />
    </PageContainer>
  );
};

export default MyClassPage;
