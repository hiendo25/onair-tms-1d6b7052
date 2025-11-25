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
            courses: [
              { id: "1", title: "4 buổi làm sao quản lý kỹ năng giao tiếp" },
              { id: "6", title: "Kỹ năng thuyết trình" },
            ],
          },
          {
            name: "Quản lý thời gian và ưu tiên công việc",
            description: "Tối ưu hóa năng suất làm việc thông qua quản lý thời gian hiệu quả, phân bổ nguồn lực hợp lý và ưu tiên các công việc quan trọng",
            courses: [
              { id: "5", title: "Quản lý thời gian hiệu quả" },
            ],
          },
          {
            name: "Xây dựng và phát triển đội nhóm",
            description: "Kỹ năng tuyển dụng, đào tạo và phát triển nhân viên, tạo môi trường làm việc tích cực và động lực cho đội nhóm",
            courses: [
              { id: "2", title: "Môn học Kỹ năng làm việc đội nhóm" },
              { id: "9", title: "Làm việc nhóm hiệu quả" },
            ],
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
  "3": {
    info: {
      name: "Kế hoạch đào tạo kỹ năng lãnh đạo và quản lý 2026",
      objective: "Phát triển đội ngũ quản lý cấp trung và cấp cao",
      startDate: "01/01/2026",
      endDate: "30/06/2026",
      budget: 450000000,
    },
    programs: [
      {
        name: "Kỹ năng lãnh đạo hiện đại",
        startDate: "01/01/2026",
        endDate: "28/02/2026",
        description: "Chương trình đào tạo lãnh đạo cho quản lý cấp trung",
        topics: [
          {
            name: "Lãnh đạo và tư duy chiến lược",
            description: "Phát triển tư duy chiến lược và kỹ năng ra quyết định cho lãnh đạo",
            courses: [
              { id: "1", title: "Tư duy chiến lược cho lãnh đạo" },
              { id: "2", title: "Kỹ năng ra quyết định" },
            ],
          },
          {
            name: "Quản lý đội nhóm hiệu quả",
            description: "Xây dựng và phát triển đội nhóm làm việc hiệu quả",
            courses: [
              { id: "3", title: "Xây dựng và phát triển đội nhóm" },
              { id: "4", title: "Kỹ năng coaching và mentoring" },
            ],
          },
        ],
      },
      {
        name: "Quản lý hiệu suất và KPI",
        startDate: "01/03/2026",
        endDate: "30/04/2026",
        description: "Đào tạo về đo lường và quản lý hiệu suất làm việc",
        topics: [
          {
            name: "Thiết lập KPI và OKR",
            description: "Xây dựng hệ thống đo lường hiệu suất làm việc",
            courses: [
              { id: "5", title: "Xây dựng hệ thống KPI" },
              { id: "6", title: "OKR trong thực tế" },
            ],
          },
          {
            name: "Đánh giá và phản hồi hiệu suất",
            description: "Kỹ năng đánh giá và phản hồi xây dựng cho nhân viên",
            courses: [
              { id: "7", title: "Kỹ năng đánh giá nhân viên" },
              { id: "8", title: "Phản hồi xây dựng và động viên" },
            ],
          },
          {
            name: "Quản lý thời gian và năng suất",
            description: "Tối ưu hóa năng suất làm việc cá nhân và đội nhóm",
            courses: [
              { id: "9", title: "Tối ưu hóa năng suất làm việc" },
            ],
          },
        ],
      },
      {
        name: "Giao tiếp và thuyết trình cho lãnh đạo",
        startDate: "01/05/2026",
        endDate: "30/06/2026",
        description: "Nâng cao kỹ năng giao tiếp và thuyết trình",
        topics: [
          {
            name: "Kỹ năng giao tiếp hiệu quả",
            description: "Giao tiếp chuyên nghiệp trong môi trường đa văn hóa",
            courses: [
              { id: "10", title: "Giao tiếp trong môi trường đa văn hóa" },
              { id: "11", title: "Kỹ năng đàm phán và thương lượng" },
            ],
          },
          {
            name: "Thuyết trình chuyên nghiệp",
            description: "Kỹ thuật thuyết trình và storytelling trong kinh doanh",
            courses: [
              { id: "12", title: "Kỹ thuật thuyết trình trước đám đông" },
              { id: "13", title: "Storytelling trong kinh doanh" },
            ],
          },
        ],
      },
    ],
  },
  "4": {
    info: {
      name: "Kế hoạch đào tạo kỹ năng mềm cho nhân viên mới 2026",
      objective: "Trang bị kỹ năng cơ bản cho nhân viên mới gia nhập công ty",
      startDate: "01/02/2026",
      endDate: "31/05/2026",
      budget: 180000000,
    },
    programs: [
      {
        name: "Hội nhập và văn hóa doanh nghiệp",
        startDate: "01/02/2026",
        endDate: "28/02/2026",
        description: "Giúp nhân viên mới hiểu và hòa nhập văn hóa công ty",
        topics: [
          {
            name: "Giới thiệu về công ty",
            description: "Tìm hiểu về tầm nhìn, sứ mệnh và cơ cấu tổ chức",
            courses: [
              { id: "1", title: "Tầm nhìn, sứ mệnh và giá trị cốt lõi" },
              { id: "2", title: "Cơ cấu tổ chức và quy trình làm việc" },
            ],
          },
          {
            name: "Kỹ năng làm việc nhóm",
            description: "Giao tiếp và hợp tác hiệu quả trong nhóm",
            courses: [
              { id: "3", title: "Giao tiếp và hợp tác trong nhóm" },
              { id: "4", title: "Giải quyết xung đột trong công việc" },
            ],
          },
        ],
      },
      {
        name: "Kỹ năng chuyên môn cơ bản",
        startDate: "01/03/2026",
        endDate: "31/05/2026",
        description: "Trang bị kỹ năng làm việc thiết yếu",
        topics: [
          {
            name: "Quản lý thời gian và công việc",
            description: "Lập kế hoạch và sử dụng công cụ quản lý công việc",
            courses: [
              { id: "5", title: "Lập kế hoạch và ưu tiên công việc" },
              { id: "6", title: "Công cụ quản lý công việc hiện đại" },
            ],
          },
          {
            name: "Kỹ năng giao tiếp chuyên nghiệp",
            description: "Viết email và trình bày báo cáo chuyên nghiệp",
            courses: [
              { id: "7", title: "Email và văn bản công việc" },
              { id: "8", title: "Kỹ năng trình bày và báo cáo" },
            ],
          },
          {
            name: "Tư duy sáng tạo và giải quyết vấn đề",
            description: "Phát triển tư duy sáng tạo và kỹ năng giải quyết vấn đề",
            courses: [
              { id: "9", title: "Kỹ thuật tư duy sáng tạo" },
              { id: "10", title: "Phương pháp giải quyết vấn đề" },
            ],
          },
        ],
      },
    ],
  },
  "5": {
    info: {
      name: "Kế hoạch đào tạo công nghệ và kỹ năng số 2026",
      objective: "Nâng cao năng lực công nghệ và chuyển đổi số cho toàn bộ nhân viên",
      startDate: "01/03/2026",
      endDate: "31/08/2026",
      budget: 350000000,
    },
    programs: [
      {
        name: "Kỹ năng số cơ bản",
        startDate: "01/03/2026",
        endDate: "30/04/2026",
        description: "Trang bị kỹ năng công nghệ thiết yếu cho mọi nhân viên",
        topics: [
          {
            name: "Microsoft Office nâng cao",
            description: "Excel, PowerPoint và các công cụ Office chuyên nghiệp",
            courses: [
              { id: "1", title: "Excel nâng cao và phân tích dữ liệu" },
              { id: "2", title: "PowerPoint và kỹ thuật trình bày" },
            ],
          },
          {
            name: "Công cụ cộng tác trực tuyến",
            description: "Google Workspace, Microsoft Teams và Slack",
            courses: [
              { id: "3", title: "Google Workspace cho doanh nghiệp" },
              { id: "4", title: "Microsoft Teams và Slack" },
            ],
          },
        ],
      },
      {
        name: "Phân tích dữ liệu và Business Intelligence",
        startDate: "01/05/2026",
        endDate: "30/06/2026",
        description: "Đào tạo kỹ năng phân tích dữ liệu cho các vị trí quản lý",
        topics: [
          {
            name: "Phân tích dữ liệu cơ bản",
            description: "SQL, Python và các công cụ phân tích dữ liệu",
            courses: [
              { id: "5", title: "SQL và quản lý cơ sở dữ liệu" },
              { id: "6", title: "Python cho phân tích dữ liệu" },
            ],
          },
          {
            name: "Trực quan hóa dữ liệu",
            description: "Power BI, Tableau và data visualization",
            courses: [
              { id: "7", title: "Power BI cho doanh nghiệp" },
              { id: "8", title: "Tableau và Data Visualization" },
            ],
          },
        ],
      },
      {
        name: "An ninh mạng và bảo mật thông tin",
        startDate: "01/07/2026",
        endDate: "31/08/2026",
        description: "Đào tạo nhận thức về an ninh mạng cho toàn bộ nhân viên",
        topics: [
          {
            name: "An ninh mạng cơ bản",
            description: "Nhận thức và phòng chống tấn công mạng",
            courses: [
              { id: "9", title: "Nhận thức về an ninh mạng" },
              { id: "10", title: "Phòng chống tấn công mạng" },
            ],
          },
          {
            name: "Bảo mật dữ liệu và quyền riêng tư",
            description: "GDPR và quản lý mật khẩu an toàn",
            courses: [
              { id: "11", title: "GDPR và bảo vệ dữ liệu cá nhân" },
              { id: "12", title: "Quản lý mật khẩu và xác thực" },
            ],
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

