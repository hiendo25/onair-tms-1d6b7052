"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import PageContainer from "@/shared/ui/PageContainer";
import PlanForm from "@/app/(organization)/admin/plans/_components/PlanForm";
import { PlanFormSchema } from "@/modules/plans/plan-form.schema";
import useNotifications from "@/hooks/useNotifications/useNotifications";

interface EditPlanFormProps {
  planId: string;
}

// Mock data for different plan IDs
const MOCK_PLANS: Record<string, PlanFormSchema> = {
  "1": {
    info: {
      name: "Kế hoạch đào tạo 2025 cho khối B2B Edtech",
      objective: "Nâng cao kỹ năng chuyên môn và kỹ năng mềm cho đội ngũ nhân viên khối B2B Edtech, tập trung vào kỹ năng lãnh đạo, kỹ thuật và phát triển sản phẩm",
      startDate: "15/01/2025",
      endDate: "30/12/2025",
      budget: 500000000,
    },
    programs: [
      {
        name: "Chương trình đào tạo kỹ năng lãnh đạo",
        startDate: "15/01/2025",
        endDate: "30/06/2025",
        description: "Phát triển kỹ năng lãnh đạo cho các quản lý cấp trung và cấp cao, bao gồm quản lý nhóm, ra quyết định chiến lược và phát triển tổ chức",
        topics: [
          {
            name: "Kỹ năng giao tiếp hiệu quả",
            description: "Học cách giao tiếp rõ ràng và thuyết phục trong môi trường làm việc, xây dựng mối quan hệ tốt với đồng nghiệp và khách hàng",
          },
          {
            name: "Quản lý thời gian và ưu tiên công việc",
            description: "Tối ưu hóa năng suất làm việc thông qua quản lý thời gian hiệu quả, phân bổ nguồn lực hợp lý và ưu tiên các công việc quan trọng",
          },
          {
            name: "Xây dựng và phát triển đội nhóm",
            description: "Kỹ năng tuyển dụng, đào tạo và phát triển nhân viên, tạo môi trường làm việc tích cực và động lực cho đội nhóm",
          },
        ],
      },
      {
        name: "Chương trình đào tạo kỹ thuật và công nghệ",
        startDate: "01/03/2025",
        endDate: "30/11/2025",
        description: "Nâng cao kỹ năng kỹ thuật cho đội ngũ phát triển sản phẩm, bao gồm các công nghệ mới nhất và best practices trong ngành",
        topics: [
          {
            name: "Kiến trúc hệ thống và thiết kế phần mềm",
            description: "Học các nguyên tắc thiết kế hệ thống scalable, maintainable và các design patterns phổ biến",
          },
          {
            name: "DevOps và CI/CD",
            description: "Tự động hóa quy trình phát triển và triển khai phần mềm, sử dụng các công cụ DevOps hiện đại",
          },
        ],
      },
      {
        name: "Chương trình đào tạo phát triển sản phẩm",
        startDate: "01/02/2025",
        endDate: "31/08/2025",
        description: "Đào tạo về quy trình phát triển sản phẩm từ ý tưởng đến triển khai, tập trung vào user experience và product-market fit",
        topics: [
          {
            name: "Product Management cơ bản",
            description: "Hiểu về vai trò Product Manager, cách xác định vision và roadmap sản phẩm, làm việc với stakeholders",
          },
          {
            name: "User Research và UX Design",
            description: "Phương pháp nghiên cứu người dùng, thiết kế trải nghiệm người dùng và kiểm thử usability",
          },
          {
            name: "Agile và Scrum",
            description: "Áp dụng phương pháp Agile trong phát triển sản phẩm, sử dụng Scrum framework hiệu quả",
          },
        ],
      },
    ],
  },
  "2": {
    info: {
      name: "Kế hoạch đào tạo Q1 2025 - Khối Marketing",
      objective: "Nâng cao năng lực marketing digital và content creation cho đội ngũ marketing",
      startDate: "01/01/2025",
      endDate: "31/03/2025",
      budget: 150000000,
    },
    programs: [
      {
        name: "Digital Marketing Fundamentals",
        startDate: "01/01/2025",
        endDate: "28/02/2025",
        description: "Kiến thức nền tảng về marketing digital, SEO, SEM và social media marketing",
        topics: [
          {
            name: "SEO và Content Marketing",
            description: "Tối ưu hóa công cụ tìm kiếm và chiến lược content marketing hiệu quả",
          },
          {
            name: "Social Media Marketing",
            description: "Xây dựng và quản lý chiến dịch marketing trên các nền tảng mạng xã hội",
          },
        ],
      },
      {
        name: "Data Analytics for Marketing",
        startDate: "01/02/2025",
        endDate: "31/03/2025",
        description: "Sử dụng data analytics để đo lường và tối ưu hiệu quả marketing",
        topics: [
          {
            name: "Google Analytics và Tag Manager",
            description: "Cài đặt và sử dụng Google Analytics để theo dõi hành vi người dùng",
          },
          {
            name: "Marketing Attribution và ROI",
            description: "Đo lường hiệu quả marketing và tính toán ROI cho các chiến dịch",
          },
        ],
      },
    ],
  },
};

export default function EditPlanForm({ planId }: EditPlanFormProps) {
  const router = useRouter();
  const { show } = useNotifications();

  // Get mock data for the plan ID
  const planData = MOCK_PLANS[planId];

  // If plan not found, show error
  if (!planData) {
    return (
      <PageContainer
        title="Kế hoạch không tồn tại"
        breadcrumbs={[
          { title: "Kế hoạch đào tạo", path: "/admin/plans" },
          { title: "Chỉnh sửa", path: `/admin/plans/${planId}/edit` },
        ]}
      >
        <div>Không tìm thấy kế hoạch đào tạo với ID: {planId}</div>
      </PageContainer>
    );
  }

  const handleSubmit = (data: PlanFormSchema) => {
    console.log("Updated plan data:", data);
    show("Cập nhật kế hoạch đào tạo thành công!", { severity: "success" });
    router.push("/admin/plans");
  };

  return (
    <PageContainer
      title="Chỉnh sửa kế hoạch đào tạo"
      breadcrumbs={[
        { title: "Kế hoạch đào tạo", path: "/admin/plans" },
        { title: "Chỉnh sửa", path: `/admin/plans/${planId}/edit` },
      ]}
    >
      <PlanForm 
        onSubmit={handleSubmit} 
        mode="edit"
        initialData={planData}
      />
    </PageContainer>
  );
}

