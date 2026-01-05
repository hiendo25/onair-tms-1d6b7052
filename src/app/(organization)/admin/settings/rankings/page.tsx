import { Typography } from "@mui/material";

import ListManageLevels from "@/modules/ranking/container/ListManageLevels";
import PageContainer from "@/shared/ui/PageContainer";

import ButtonCreateLevel from "./_components/ButtonCreateLevel";

export default function RankingPage() {
  return (
    <PageContainer
      title="Quản lý danh hiệu"
      breadcrumbs={[
        {
          title: "Thiết lập",
        },
        {
          title: "Danh hiệu",
        },
      ]}
    >
      <div>
        <Typography component="p" variant="body2">
          Thiết lập danh hiệu tự động theo thành tích.
        </Typography>
      </div>
      <div className="flex items-center mb-6">
        <div className="flex-1"></div>
        <ButtonCreateLevel />
      </div>
      <ListManageLevels />
    </PageContainer>
  );
}
