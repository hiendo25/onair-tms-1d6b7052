import PageContainer from "@/shared/ui/PageContainer";

import MyGamificationContent from "./_components/MyGamificationContent";

export default function MyGamificationPage() {
  return (
    <PageContainer
      title="Điểm thưởng của bạn"
      breadcrumbs={[
        {
          title: "Thưởng",
        },
      ]}
    >
      <MyGamificationContent />
    </PageContainer>
  );
}
