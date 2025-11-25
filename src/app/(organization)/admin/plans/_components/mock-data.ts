// Mock data types
export interface PlanDetail {
  id: string;
  name: string;
  objective: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: "pending" | "approved" | "rejected";
  approver: string;
  approverRole: string;
  programsCount: number;
  topicsCount: number;
  coursesCount: number;
  instructorsCount: number;
  programs: ProgramDetail[];
}

export interface ClassInstance {
  id: string;
  classCode: string;
  deliveryMode: "Online" | "Offline" | "Live";
  instructor: string;
  date: string;
}

export interface Course {
  id: string;
  title: string;
  classesCount: number;
  classes: ClassInstance[];
}

export interface Topic {
  id: string;
  title: string;
  description?: string;
  coursesCount: number;
  courses: Course[];
}

export interface ProgramDetail {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  topicsCount: number;
  topics?: Topic[];
}

// Mock data
export const MOCK_PLAN_DETAILS: Record<string, PlanDetail> = {
  "1": {
    id: "1",
    name: "Kế hoạch đào tạo 2026 cho khối B2B Edtech",
    objective: "Hội nhập – Chuẩn hoá – Phát triển năng lực",
    startDate: "22/12/2025",
    endDate: "22/12/2026",
    budget: 300000000,
    status: "pending",
    approver: "Nguyễn Văn Nam - CEO",
    approverRole: "CEO",
    programsCount: 3,
    topicsCount: 7,
    coursesCount: 14,
    instructorsCount: 12,
    programs: [
      {
        id: "1",
        name: "Cách Sales B2b hiệu quả cho phòng MKT",
        description: "Chương trình \"Kế hoạch đào tạo 2026 cho khối B2B Edtech\" được xây dựng nhằm giúp đội ngũ nắm vững định hướng chiến lược đào tạo trong năm 2026, tập trung vào phát triển kỹ năng bán hàng B2B và marketing hiệu quả. Chương trình bao gồm các khóa học về kỹ năng giao tiếp, xây dựng mối quan hệ khách hàng, và chiến lược marketing số cho thị trường B2B.",
        startDate: "22/12/2025",
        endDate: "22/12/2026",
        topicsCount: 2,
        topics: [
          {
            id: "1",
            title: "Kỹ năng bán hàng B2B cơ bản",
            description: "Chủ đề này tập trung vào việc xây dựng nền tảng kỹ năng bán hàng B2B cho đội ngũ, bao gồm kỹ năng giao tiếp hiệu quả, xây dựng mối quan hệ lâu dài với khách hàng doanh nghiệp, và các kỹ thuật thuyết phục chuyên nghiệp trong môi trường B2B.",
            coursesCount: 2,
            courses: [
              {
                id: "1",
                title: "Kỹ năng giao tiếp trong bán hàng",
                classesCount: 2,
                classes: [
                  {
                    id: "1",
                    classCode: "B2B-101",
                    deliveryMode: "Online",
                    instructor: "GV - Nguyễn Văn Nam",
                    date: "22/12/2025",
                  },
                  {
                    id: "2",
                    classCode: "B2B-101",
                    deliveryMode: "Live",
                    instructor: "GV - Nguyễn Văn Nam",
                    date: "25/12/2025",
                  },
                ],
              },
              {
                id: "2",
                title: "Xây dựng mối quan hệ khách hàng",
                classesCount: 2,
                classes: [
                  {
                    id: "3",
                    classCode: "B2B-102",
                    deliveryMode: "Offline",
                    instructor: "GV - Trần Thị Lan",
                    date: "28/12/2025",
                  },
                  {
                    id: "4",
                    classCode: "B2B-102",
                    deliveryMode: "Offline",
                    instructor: "GV - Trần Thị Lan",
                    date: "30/12/2025",
                  },
                ],
              },
            ],
          },
          {
            id: "2",
            title: "Chiến lược Marketing B2B",
            description: "Khóa học ngắn",
            coursesCount: 2,
            courses: [
              {
                id: "3",
                title: "Digital Marketing cho B2B",
                classesCount: 3,
                classes: [
                  {
                    id: "5",
                    classCode: "MKT-201",
                    deliveryMode: "Online",
                    instructor: "GV - Phạm Minh Tuấn",
                    date: "05/01/2026",
                  },
                  {
                    id: "6",
                    classCode: "MKT-201",
                    deliveryMode: "Live",
                    instructor: "GV - Phạm Minh Tuấn",
                    date: "08/01/2026",
                  },
                  {
                    id: "7",
                    classCode: "MKT-202",
                    deliveryMode: "Online",
                    instructor: "GV - Lê Thị Hương",
                    date: "10/01/2026",
                  },
                ],
              },
              {
                id: "4",
                title: "Content Marketing hiệu quả",
                classesCount: 2,
                classes: [
                  {
                    id: "8",
                    classCode: "MKT-203",
                    deliveryMode: "Live",
                    instructor: "GV - Hoàng Văn Đức",
                    date: "12/01/2026",
                  },
                  {
                    id: "9",
                    classCode: "MKT-203",
                    deliveryMode: "Offline",
                    instructor: "GV - Hoàng Văn Đức",
                    date: "15/01/2026",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "2",
        name: "Quản lý dự án và Agile",
        description: "Chương trình đào tạo cơ bản",
        startDate: "15/01/2026",
        endDate: "15/04/2026",
        topicsCount: 3,
        topics: [
          {
            id: "3",
            title: "Agile và Scrum cơ bản",
            description: "Chủ đề này giới thiệu phương pháp Agile và Scrum Framework, giúp đội ngũ hiểu rõ các nguyên tắc cơ bản của phát triển phần mềm linh hoạt, vai trò trong Scrum team, và cách tổ chức các Sprint hiệu quả để tăng năng suất làm việc nhóm.",
            coursesCount: 2,
            courses: [
              {
                id: "5",
                title: "Giới thiệu Agile Methodology",
                classesCount: 2,
                classes: [
                  {
                    id: "10",
                    classCode: "PM-101",
                    deliveryMode: "Online",
                    instructor: "GV - Vũ Thị Lan",
                    date: "15/01/2026",
                  },
                  {
                    id: "11",
                    classCode: "PM-101",
                    deliveryMode: "Live",
                    instructor: "GV - Vũ Thị Lan",
                    date: "18/01/2026",
                  },
                ],
              },
              {
                id: "6",
                title: "Scrum Framework thực hành",
                classesCount: 3,
                classes: [
                  {
                    id: "12",
                    classCode: "PM-102",
                    deliveryMode: "Offline",
                    instructor: "GV - Đặng Minh Quân",
                    date: "20/01/2026",
                  },
                  {
                    id: "13",
                    classCode: "PM-102",
                    deliveryMode: "Offline",
                    instructor: "GV - Đặng Minh Quân",
                    date: "22/01/2026",
                  },
                  {
                    id: "14",
                    classCode: "PM-103",
                    deliveryMode: "Online",
                    instructor: "GV - Bùi Văn Thành",
                    date: "25/01/2026",
                  },
                ],
              },
            ],
          },
          {
            id: "4",
            title: "Quản lý rủi ro và chất lượng",
            description: "Học cách nhận diện và quản lý rủi ro",
            coursesCount: 1,
            courses: [
              {
                id: "7",
                title: "Quản lý rủi ro trong dự án",
                classesCount: 2,
                classes: [
                  {
                    id: "15",
                    classCode: "PM-201",
                    deliveryMode: "Live",
                    instructor: "GV - Lý Thị Nga",
                    date: "01/02/2026",
                  },
                  {
                    id: "16",
                    classCode: "PM-201",
                    deliveryMode: "Online",
                    instructor: "GV - Lý Thị Nga",
                    date: "05/02/2026",
                  },
                ],
              },
            ],
          },
          {
            id: "5",
            title: "Công cụ quản lý dự án",
            coursesCount: 2,
            courses: [
              {
                id: "8",
                title: "Jira và Confluence",
                classesCount: 2,
                classes: [
                  {
                    id: "17",
                    classCode: "PM-301",
                    deliveryMode: "Online",
                    instructor: "GV - Trịnh Văn Hải",
                    date: "10/02/2026",
                  },
                  {
                    id: "18",
                    classCode: "PM-301",
                    deliveryMode: "Live",
                    instructor: "GV - Trịnh Văn Hải",
                    date: "12/02/2026",
                  },
                ],
              },
              {
                id: "9",
                title: "Microsoft Project và Planner",
                classesCount: 1,
                classes: [
                  {
                    id: "19",
                    classCode: "PM-302",
                    deliveryMode: "Offline",
                    instructor: "GV - Nguyễn Thị Mai",
                    date: "15/02/2026",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "3",
        name: "Chuyển đổi số và AI trong doanh nghiệp",
        description: "Chương trình tập trung vào việc ứng dụng công nghệ AI và chuyển đổi số trong hoạt động kinh doanh, giúp doanh nghiệp tối ưu hóa quy trình và nâng cao hiệu quả làm việc. Các khóa học bao gồm nền tảng chuyển đổi số, công cụ AI thực tế, và cách triển khai Machine Learning trong các dự án thực tế.",
        startDate: "01/03/2026",
        endDate: "31/05/2026",
        topicsCount: 2,
        topics: [
          {
            id: "6",
            title: "Chiến lược chuyển đổi số",
            coursesCount: 2,
            courses: [
              {
                id: "10",
                title: "Nền tảng chuyển đổi số",
                classesCount: 2,
                classes: [
                  {
                    id: "20",
                    classCode: "DT-101",
                    deliveryMode: "Live",
                    instructor: "GV - Trần Văn Hùng",
                    date: "01/03/2026",
                  },
                  {
                    id: "21",
                    classCode: "DT-101",
                    deliveryMode: "Online",
                    instructor: "GV - Trần Văn Hùng",
                    date: "05/03/2026",
                  },
                ],
              },
              {
                id: "11",
                title: "Công cụ và nền tảng số",
                classesCount: 2,
                classes: [
                  {
                    id: "22",
                    classCode: "DT-102",
                    deliveryMode: "Offline",
                    instructor: "GV - Phạm Minh Tuấn",
                    date: "10/03/2026",
                  },
                  {
                    id: "23",
                    classCode: "DT-102",
                    deliveryMode: "Online",
                    instructor: "GV - Phạm Minh Tuấn",
                    date: "12/03/2026",
                  },
                ],
              },
            ],
          },
          {
            id: "7",
            title: "AI và Machine Learning ứng dụng",
            coursesCount: 2,
            courses: [
              {
                id: "12",
                title: "Giới thiệu AI cho doanh nghiệp",
                classesCount: 3,
                classes: [
                  {
                    id: "24",
                    classCode: "AI-101",
                    deliveryMode: "Online",
                    instructor: "GV - Lê Thị Hương",
                    date: "15/03/2026",
                  },
                  {
                    id: "25",
                    classCode: "AI-101",
                    deliveryMode: "Live",
                    instructor: "GV - Lê Thị Hương",
                    date: "18/03/2026",
                  },
                  {
                    id: "26",
                    classCode: "AI-102",
                    deliveryMode: "Offline",
                    instructor: "GV - Hoàng Văn Đức",
                    date: "20/03/2026",
                  },
                ],
              },
              {
                id: "13",
                title: "Ứng dụng AI trong Marketing và Sales",
                classesCount: 2,
                classes: [
                  {
                    id: "27",
                    classCode: "AI-201",
                    deliveryMode: "Live",
                    instructor: "GV - Vũ Thị Lan",
                    date: "25/03/2026",
                  },
                  {
                    id: "28",
                    classCode: "AI-201",
                    deliveryMode: "Online",
                    instructor: "GV - Vũ Thị Lan",
                    date: "28/03/2026",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  "2": {
    id: "2",
    name: "Khoá học cơ bản về AI dành cho Doanh nghiệp",
    objective: "Nâng cao kiến thức AI cho toàn bộ nhân viên",
    startDate: "15/10/2025",
    endDate: "20/10/2025",
    budget: 200000000,
    status: "approved",
    approver: "Trần Thị Lan - CTO",
    approverRole: "CTO",
    programsCount: 2,
    topicsCount: 8,
    coursesCount: 15,
    instructorsCount: 8,
    programs: [
      {
        id: "1",
        name: "AI Fundamentals",
        description: "Chương trình giới thiệu nền tảng về trí tuệ nhân tạo, bao gồm các khái niệm cơ bản, ứng dụng thực tế và xu hướng phát triển của AI trong doanh nghiệp. Khóa học phù hợp cho mọi đối tượng nhân viên muốn hiểu rõ hơn về công nghệ AI và cách áp dụng vào công việc hàng ngày.",
        startDate: "15/10/2025",
        endDate: "17/10/2025",
        topicsCount: 1,
        topics: [
          {
            id: "3",
            title: "AI Fundamentals",
            coursesCount: 2,
            courses: [
              {
                id: "5",
                title: "Introduction to AI",
                classesCount: 2,
                classes: [
                  {
                    id: "9",
                    classCode: "AI-101",
                    deliveryMode: "Online",
                    instructor: "GV - Trần Văn An",
                    date: "15/10/2025",
                  },
                  {
                    id: "10",
                    classCode: "AI-101",
                    deliveryMode: "Live",
                    instructor: "GV - Trần Văn An",
                    date: "16/10/2025",
                  },
                ],
              },
              {
                id: "6",
                title: "Machine Learning Basics",
                classesCount: 1,
                classes: [
                  {
                    id: "11",
                    classCode: "AI-102",
                    deliveryMode: "Online",
                    instructor: "GV - Lê Thị Bình",
                    date: "17/10/2025",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "2",
        name: "AI Applications in Business",
        startDate: "18/10/2025",
        endDate: "20/10/2025",
        topicsCount: 1,
        topics: [
          {
            id: "4",
            title: "AI Applications in Business",
            coursesCount: 2,
            courses: [
              {
                id: "7",
                title: "AI in Marketing",
                classesCount: 2,
                classes: [
                  {
                    id: "12",
                    classCode: "AI-201",
                    deliveryMode: "Offline",
                    instructor: "GV - Phạm Văn Cường",
                    date: "18/10/2025",
                  },
                  {
                    id: "13",
                    classCode: "AI-201",
                    deliveryMode: "Online",
                    instructor: "GV - Phạm Văn Cường",
                    date: "19/10/2025",
                  },
                ],
              },
              {
                id: "8",
                title: "AI in Sales",
                classesCount: 1,
                classes: [
                  {
                    id: "14",
                    classCode: "AI-202",
                    deliveryMode: "Live",
                    instructor: "GV - Hoàng Thị Dung",
                    date: "20/10/2025",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  "3": {
    id: "3",
    name: "Kế hoạch đào tạo kỹ năng lãnh đạo và quản lý 2026",
    objective: "Phát triển đội ngũ quản lý cấp trung và cấp cao",
    startDate: "01/01/2026",
    endDate: "30/06/2026",
    budget: 450000000,
    status: "pending",
    approver: "Lê Văn Hùng - COO",
    approverRole: "COO",
    programsCount: 3,
    topicsCount: 7,
    coursesCount: 13,
    instructorsCount: 10,
    programs: [
      {
        id: "1",
        name: "Kỹ năng lãnh đạo hiện đại",
        description: "Chương trình đào tạo toàn diện về kỹ năng lãnh đạo hiện đại, tập trung vào phát triển tư duy chiến lược và khả năng quản lý đội nhóm hiệu quả. Các khóa học giúp lãnh đạo nắm vững các kỹ năng ra quyết định, coaching, mentoring và xây dựng văn hóa làm việc tích cực trong tổ chức.",
        startDate: "01/01/2026",
        endDate: "28/02/2026",
        topicsCount: 2,
        topics: [
          {
            id: "1",
            title: "Lãnh đạo và tư duy chiến lược",
            coursesCount: 2,
            courses: [
              {
                id: "1",
                title: "Tư duy chiến lược cho lãnh đạo",
                classesCount: 3,
                classes: [
                  {
                    id: "1",
                    classCode: "LD-101",
                    deliveryMode: "Offline",
                    instructor: "GV - Nguyễn Minh Quân",
                    date: "05/01/2026",
                  },
                  {
                    id: "2",
                    classCode: "LD-101",
                    deliveryMode: "Live",
                    instructor: "GV - Nguyễn Minh Quân",
                    date: "08/01/2026",
                  },
                  {
                    id: "3",
                    classCode: "LD-102",
                    deliveryMode: "Online",
                    instructor: "GV - Trần Văn Hải",
                    date: "10/01/2026",
                  },
                ],
              },
              {
                id: "2",
                title: "Kỹ năng ra quyết định",
                classesCount: 2,
                classes: [
                  {
                    id: "4",
                    classCode: "LD-103",
                    deliveryMode: "Offline",
                    instructor: "GV - Phạm Thị Hoa",
                    date: "15/01/2026",
                  },
                  {
                    id: "5",
                    classCode: "LD-103",
                    deliveryMode: "Live",
                    instructor: "GV - Phạm Thị Hoa",
                    date: "18/01/2026",
                  },
                ],
              },
            ],
          },
          {
            id: "2",
            title: "Quản lý đội nhóm hiệu quả",
            coursesCount: 2,
            courses: [
              {
                id: "3",
                title: "Xây dựng và phát triển đội nhóm",
                classesCount: 2,
                classes: [
                  {
                    id: "6",
                    classCode: "TM-101",
                    deliveryMode: "Online",
                    instructor: "GV - Lê Thị Mai",
                    date: "22/01/2026",
                  },
                  {
                    id: "7",
                    classCode: "TM-101",
                    deliveryMode: "Offline",
                    instructor: "GV - Lê Thị Mai",
                    date: "25/01/2026",
                  },
                ],
              },
              {
                id: "4",
                title: "Kỹ năng coaching và mentoring",
                classesCount: 3,
                classes: [
                  {
                    id: "8",
                    classCode: "TM-102",
                    deliveryMode: "Live",
                    instructor: "GV - Hoàng Văn Tùng",
                    date: "28/01/2026",
                  },
                  {
                    id: "9",
                    classCode: "TM-102",
                    deliveryMode: "Offline",
                    instructor: "GV - Hoàng Văn Tùng",
                    date: "01/02/2026",
                  },
                  {
                    id: "10",
                    classCode: "TM-103",
                    deliveryMode: "Online",
                    instructor: "GV - Vũ Thị Lan",
                    date: "05/02/2026",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "2",
        name: "Quản lý hiệu suất và KPI",
        startDate: "01/03/2026",
        endDate: "30/04/2026",
        topicsCount: 3,
        topics: [
          {
            id: "3",
            title: "Thiết lập KPI và OKR",
            coursesCount: 2,
            courses: [
              {
                id: "5",
                title: "Xây dựng hệ thống KPI",
                classesCount: 2,
                classes: [
                  {
                    id: "11",
                    classCode: "KPI-101",
                    deliveryMode: "Offline",
                    instructor: "GV - Nguyễn Thị Hương",
                    date: "05/03/2026",
                  },
                  {
                    id: "12",
                    classCode: "KPI-101",
                    deliveryMode: "Live",
                    instructor: "GV - Nguyễn Thị Hương",
                    date: "08/03/2026",
                  },
                ],
              },
              {
                id: "6",
                title: "OKR trong thực tế",
                classesCount: 2,
                classes: [
                  {
                    id: "13",
                    classCode: "OKR-101",
                    deliveryMode: "Online",
                    instructor: "GV - Trần Minh Đức",
                    date: "12/03/2026",
                  },
                  {
                    id: "14",
                    classCode: "OKR-101",
                    deliveryMode: "Offline",
                    instructor: "GV - Trần Minh Đức",
                    date: "15/03/2026",
                  },
                ],
              },
            ],
          },
          {
            id: "4",
            title: "Đánh giá và phản hồi hiệu suất",
            coursesCount: 2,
            courses: [
              {
                id: "7",
                title: "Kỹ năng đánh giá nhân viên",
                classesCount: 3,
                classes: [
                  {
                    id: "15",
                    classCode: "PF-101",
                    deliveryMode: "Live",
                    instructor: "GV - Phạm Văn Long",
                    date: "20/03/2026",
                  },
                  {
                    id: "16",
                    classCode: "PF-101",
                    deliveryMode: "Offline",
                    instructor: "GV - Phạm Văn Long",
                    date: "22/03/2026",
                  },
                  {
                    id: "17",
                    classCode: "PF-102",
                    deliveryMode: "Online",
                    instructor: "GV - Lê Thị Nga",
                    date: "25/03/2026",
                  },
                ],
              },
              {
                id: "8",
                title: "Phản hồi xây dựng và động viên",
                classesCount: 2,
                classes: [
                  {
                    id: "18",
                    classCode: "FB-101",
                    deliveryMode: "Offline",
                    instructor: "GV - Hoàng Thị Linh",
                    date: "28/03/2026",
                  },
                  {
                    id: "19",
                    classCode: "FB-101",
                    deliveryMode: "Live",
                    instructor: "GV - Hoàng Thị Linh",
                    date: "01/04/2026",
                  },
                ],
              },
            ],
          },
          {
            id: "5",
            title: "Quản lý thời gian và năng suất",
            coursesCount: 1,
            courses: [
              {
                id: "9",
                title: "Tối ưu hóa năng suất làm việc",
                classesCount: 2,
                classes: [
                  {
                    id: "20",
                    classCode: "TM-201",
                    deliveryMode: "Online",
                    instructor: "GV - Vũ Minh Tuấn",
                    date: "05/04/2026",
                  },
                  {
                    id: "21",
                    classCode: "TM-201",
                    deliveryMode: "Offline",
                    instructor: "GV - Vũ Minh Tuấn",
                    date: "08/04/2026",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "3",
        name: "Giao tiếp và thuyết trình cho lãnh đạo",
        description: "Chương trình phát triển kỹ năng giao tiếp chuyên nghiệp và thuyết trình hiệu quả cho các vị trí lãnh đạo, bao gồm kỹ năng đàm phán, thương lượng và storytelling trong kinh doanh. Khóa học giúp lãnh đạo tự tin trình bày ý tưởng, thuyết phục đối tác và truyền cảm hứng cho đội nhóm.",
        startDate: "01/05/2026",
        endDate: "30/06/2026",
        topicsCount: 2,
        topics: [
          {
            id: "6",
            title: "Kỹ năng giao tiếp hiệu quả",
            coursesCount: 2,
            courses: [
              {
                id: "10",
                title: "Giao tiếp trong môi trường đa văn hóa",
                classesCount: 2,
                classes: [
                  {
                    id: "22",
                    classCode: "COM-101",
                    deliveryMode: "Live",
                    instructor: "GV - Nguyễn Thị Thanh",
                    date: "05/05/2026",
                  },
                  {
                    id: "23",
                    classCode: "COM-101",
                    deliveryMode: "Offline",
                    instructor: "GV - Nguyễn Thị Thanh",
                    date: "08/05/2026",
                  },
                ],
              },
              {
                id: "11",
                title: "Kỹ năng đàm phán và thương lượng",
                classesCount: 3,
                classes: [
                  {
                    id: "24",
                    classCode: "NEG-101",
                    deliveryMode: "Offline",
                    instructor: "GV - Trần Văn Bình",
                    date: "12/05/2026",
                  },
                  {
                    id: "25",
                    classCode: "NEG-101",
                    deliveryMode: "Live",
                    instructor: "GV - Trần Văn Bình",
                    date: "15/05/2026",
                  },
                  {
                    id: "26",
                    classCode: "NEG-102",
                    deliveryMode: "Online",
                    instructor: "GV - Phạm Thị Hồng",
                    date: "18/05/2026",
                  },
                ],
              },
            ],
          },
          {
            id: "7",
            title: "Thuyết trình chuyên nghiệp",
            coursesCount: 2,
            courses: [
              {
                id: "12",
                title: "Kỹ thuật thuyết trình trước đám đông",
                classesCount: 2,
                classes: [
                  {
                    id: "27",
                    classCode: "PRE-101",
                    deliveryMode: "Offline",
                    instructor: "GV - Lê Văn Cường",
                    date: "22/05/2026",
                  },
                  {
                    id: "28",
                    classCode: "PRE-101",
                    deliveryMode: "Live",
                    instructor: "GV - Lê Văn Cường",
                    date: "25/05/2026",
                  },
                ],
              },
              {
                id: "13",
                title: "Storytelling trong kinh doanh",
                classesCount: 2,
                classes: [
                  {
                    id: "29",
                    classCode: "ST-101",
                    deliveryMode: "Online",
                    instructor: "GV - Hoàng Thị Mai",
                    date: "28/05/2026",
                  },
                  {
                    id: "30",
                    classCode: "ST-101",
                    deliveryMode: "Offline",
                    instructor: "GV - Hoàng Thị Mai",
                    date: "01/06/2026",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  "4": {
    id: "4",
    name: "Kế hoạch đào tạo kỹ năng mềm cho nhân viên mới 2026",
    objective: "Trang bị kỹ năng cơ bản cho nhân viên mới gia nhập công ty",
    startDate: "01/02/2026",
    endDate: "31/05/2026",
    budget: 180000000,
    status: "approved",
    approver: "Phạm Thị Hương - HR Director",
    approverRole: "HR Director",
    programsCount: 2,
    topicsCount: 5,
    coursesCount: 10,
    instructorsCount: 8,
    programs: [
      {
        id: "1",
        name: "Hội nhập và văn hóa doanh nghiệp",
        startDate: "01/02/2026",
        endDate: "28/02/2026",
        topicsCount: 2,
        topics: [
          {
            id: "1",
            title: "Giới thiệu về công ty",
            coursesCount: 2,
            courses: [
              {
                id: "1",
                title: "Tầm nhìn, sứ mệnh và giá trị cốt lõi",
                classesCount: 2,
                classes: [
                  {
                    id: "1",
                    classCode: "ON-101",
                    deliveryMode: "Offline",
                    instructor: "GV - Nguyễn Văn An",
                    date: "03/02/2026",
                  },
                  {
                    id: "2",
                    classCode: "ON-101",
                    deliveryMode: "Live",
                    instructor: "GV - Nguyễn Văn An",
                    date: "05/02/2026",
                  },
                ],
              },
              {
                id: "2",
                title: "Cơ cấu tổ chức và quy trình làm việc",
                classesCount: 2,
                classes: [
                  {
                    id: "3",
                    classCode: "ON-102",
                    deliveryMode: "Online",
                    instructor: "GV - Trần Thị Bích",
                    date: "07/02/2026",
                  },
                  {
                    id: "4",
                    classCode: "ON-102",
                    deliveryMode: "Offline",
                    instructor: "GV - Trần Thị Bích",
                    date: "10/02/2026",
                  },
                ],
              },
            ],
          },
          {
            id: "2",
            title: "Kỹ năng làm việc nhóm",
            coursesCount: 2,
            courses: [
              {
                id: "3",
                title: "Giao tiếp và hợp tác trong nhóm",
                classesCount: 3,
                classes: [
                  {
                    id: "5",
                    classCode: "TW-101",
                    deliveryMode: "Live",
                    instructor: "GV - Lê Minh Tuấn",
                    date: "12/02/2026",
                  },
                  {
                    id: "6",
                    classCode: "TW-101",
                    deliveryMode: "Offline",
                    instructor: "GV - Lê Minh Tuấn",
                    date: "14/02/2026",
                  },
                  {
                    id: "7",
                    classCode: "TW-102",
                    deliveryMode: "Online",
                    instructor: "GV - Phạm Thị Lan",
                    date: "17/02/2026",
                  },
                ],
              },
              {
                id: "4",
                title: "Giải quyết xung đột trong công việc",
                classesCount: 2,
                classes: [
                  {
                    id: "8",
                    classCode: "CF-101",
                    deliveryMode: "Offline",
                    instructor: "GV - Hoàng Văn Nam",
                    date: "19/02/2026",
                  },
                  {
                    id: "9",
                    classCode: "CF-101",
                    deliveryMode: "Live",
                    instructor: "GV - Hoàng Văn Nam",
                    date: "21/02/2026",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "2",
        name: "Kỹ năng chuyên môn cơ bản",
        description: "Chương trình trang bị các kỹ năng làm việc thiết yếu cho nhân viên mới, bao gồm quản lý thời gian, giao tiếp chuyên nghiệp và tư duy giải quyết vấn đề. Các khóa học giúp nhân viên nhanh chóng thích nghi với môi trường làm việc và nâng cao hiệu suất công việc ngay từ những ngày đầu.",
        startDate: "01/03/2026",
        endDate: "31/05/2026",
        topicsCount: 3,
        topics: [
          {
            id: "3",
            title: "Quản lý thời gian và công việc",
            coursesCount: 2,
            courses: [
              {
                id: "5",
                title: "Lập kế hoạch và ưu tiên công việc",
                classesCount: 2,
                classes: [
                  {
                    id: "10",
                    classCode: "TM-101",
                    deliveryMode: "Online",
                    instructor: "GV - Vũ Thị Hoa",
                    date: "03/03/2026",
                  },
                  {
                    id: "11",
                    classCode: "TM-101",
                    deliveryMode: "Offline",
                    instructor: "GV - Vũ Thị Hoa",
                    date: "05/03/2026",
                  },
                ],
              },
              {
                id: "6",
                title: "Công cụ quản lý công việc hiện đại",
                classesCount: 3,
                classes: [
                  {
                    id: "12",
                    classCode: "TL-101",
                    deliveryMode: "Live",
                    instructor: "GV - Nguyễn Minh Đức",
                    date: "07/03/2026",
                  },
                  {
                    id: "13",
                    classCode: "TL-101",
                    deliveryMode: "Online",
                    instructor: "GV - Nguyễn Minh Đức",
                    date: "10/03/2026",
                  },
                  {
                    id: "14",
                    classCode: "TL-102",
                    deliveryMode: "Offline",
                    instructor: "GV - Trần Văn Hùng",
                    date: "12/03/2026",
                  },
                ],
              },
            ],
          },
          {
            id: "4",
            title: "Kỹ năng giao tiếp chuyên nghiệp",
            coursesCount: 2,
            courses: [
              {
                id: "7",
                title: "Email và văn bản công việc",
                classesCount: 2,
                classes: [
                  {
                    id: "15",
                    classCode: "WR-101",
                    deliveryMode: "Online",
                    instructor: "GV - Lê Thị Thu",
                    date: "15/03/2026",
                  },
                  {
                    id: "16",
                    classCode: "WR-101",
                    deliveryMode: "Live",
                    instructor: "GV - Lê Thị Thu",
                    date: "17/03/2026",
                  },
                ],
              },
              {
                id: "8",
                title: "Kỹ năng trình bày và báo cáo",
                classesCount: 2,
                classes: [
                  {
                    id: "17",
                    classCode: "PR-101",
                    deliveryMode: "Offline",
                    instructor: "GV - Phạm Văn Tài",
                    date: "20/03/2026",
                  },
                  {
                    id: "18",
                    classCode: "PR-101",
                    deliveryMode: "Live",
                    instructor: "GV - Phạm Văn Tài",
                    date: "22/03/2026",
                  },
                ],
              },
            ],
          },
          {
            id: "5",
            title: "Tư duy sáng tạo và giải quyết vấn đề",
            coursesCount: 2,
            courses: [
              {
                id: "9",
                title: "Kỹ thuật tư duy sáng tạo",
                classesCount: 2,
                classes: [
                  {
                    id: "19",
                    classCode: "CR-101",
                    deliveryMode: "Live",
                    instructor: "GV - Hoàng Thị Ngọc",
                    date: "25/03/2026",
                  },
                  {
                    id: "20",
                    classCode: "CR-101",
                    deliveryMode: "Offline",
                    instructor: "GV - Hoàng Thị Ngọc",
                    date: "27/03/2026",
                  },
                ],
              },
              {
                id: "10",
                title: "Phương pháp giải quyết vấn đề",
                classesCount: 3,
                classes: [
                  {
                    id: "21",
                    classCode: "PS-101",
                    deliveryMode: "Online",
                    instructor: "GV - Vũ Minh Quân",
                    date: "30/03/2026",
                  },
                  {
                    id: "22",
                    classCode: "PS-101",
                    deliveryMode: "Offline",
                    instructor: "GV - Vũ Minh Quân",
                    date: "02/04/2026",
                  },
                  {
                    id: "23",
                    classCode: "PS-102",
                    deliveryMode: "Live",
                    instructor: "GV - Nguyễn Thị Linh",
                    date: "05/04/2026",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  "5": {
    id: "5",
    name: "Kế hoạch đào tạo công nghệ và kỹ năng số 2026",
    objective: "Nâng cao năng lực công nghệ và chuyển đổi số cho toàn bộ nhân viên",
    startDate: "01/03/2026",
    endDate: "31/08/2026",
    budget: 350000000,
    status: "pending",
    approver: "Vũ Minh Tuấn - CTO",
    approverRole: "CTO",
    programsCount: 3,
    topicsCount: 6,
    coursesCount: 12,
    instructorsCount: 9,
    programs: [
      {
        id: "1",
        name: "Kỹ năng số cơ bản",
        description: "Chương trình đào tạo kỹ năng số thiết yếu cho toàn bộ nhân viên, tập trung vào việc sử dụng thành thạo các công cụ Microsoft Office và các nền tảng cộng tác trực tuyến. Khóa học giúp nhân viên nâng cao năng suất làm việc thông qua việc ứng dụng công nghệ vào công việc hàng ngày.",
        startDate: "01/03/2026",
        endDate: "30/04/2026",
        topicsCount: 2,
        topics: [
          {
            id: "1",
            title: "Microsoft Office nâng cao",
            coursesCount: 2,
            courses: [
              {
                id: "1",
                title: "Excel nâng cao và phân tích dữ liệu",
                classesCount: 3,
                classes: [
                  {
                    id: "1",
                    classCode: "EX-101",
                    deliveryMode: "Online",
                    instructor: "GV - Nguyễn Văn Đạt",
                    date: "03/03/2026",
                  },
                  {
                    id: "2",
                    classCode: "EX-101",
                    deliveryMode: "Offline",
                    instructor: "GV - Nguyễn Văn Đạt",
                    date: "05/03/2026",
                  },
                  {
                    id: "3",
                    classCode: "EX-102",
                    deliveryMode: "Live",
                    instructor: "GV - Trần Thị Hằng",
                    date: "07/03/2026",
                  },
                ],
              },
              {
                id: "2",
                title: "PowerPoint và kỹ thuật trình bày",
                classesCount: 2,
                classes: [
                  {
                    id: "4",
                    classCode: "PP-101",
                    deliveryMode: "Offline",
                    instructor: "GV - Lê Minh Hải",
                    date: "10/03/2026",
                  },
                  {
                    id: "5",
                    classCode: "PP-101",
                    deliveryMode: "Live",
                    instructor: "GV - Lê Minh Hải",
                    date: "12/03/2026",
                  },
                ],
              },
            ],
          },
          {
            id: "2",
            title: "Công cụ cộng tác trực tuyến",
            coursesCount: 2,
            courses: [
              {
                id: "3",
                title: "Google Workspace cho doanh nghiệp",
                classesCount: 2,
                classes: [
                  {
                    id: "6",
                    classCode: "GW-101",
                    deliveryMode: "Online",
                    instructor: "GV - Phạm Thị Nhung",
                    date: "15/03/2026",
                  },
                  {
                    id: "7",
                    classCode: "GW-101",
                    deliveryMode: "Live",
                    instructor: "GV - Phạm Thị Nhung",
                    date: "17/03/2026",
                  },
                ],
              },
              {
                id: "4",
                title: "Microsoft Teams và Slack",
                classesCount: 3,
                classes: [
                  {
                    id: "8",
                    classCode: "CT-101",
                    deliveryMode: "Offline",
                    instructor: "GV - Hoàng Văn Phúc",
                    date: "20/03/2026",
                  },
                  {
                    id: "9",
                    classCode: "CT-101",
                    deliveryMode: "Online",
                    instructor: "GV - Hoàng Văn Phúc",
                    date: "22/03/2026",
                  },
                  {
                    id: "10",
                    classCode: "CT-102",
                    deliveryMode: "Live",
                    instructor: "GV - Vũ Thị Trang",
                    date: "25/03/2026",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "2",
        name: "Phân tích dữ liệu và Business Intelligence",
        startDate: "01/05/2026",
        endDate: "30/06/2026",
        topicsCount: 2,
        topics: [
          {
            id: "3",
            title: "Phân tích dữ liệu cơ bản",
            coursesCount: 2,
            courses: [
              {
                id: "5",
                title: "SQL và quản lý cơ sở dữ liệu",
                classesCount: 3,
                classes: [
                  {
                    id: "11",
                    classCode: "SQL-101",
                    deliveryMode: "Live",
                    instructor: "GV - Nguyễn Minh Tuấn",
                    date: "05/05/2026",
                  },
                  {
                    id: "12",
                    classCode: "SQL-101",
                    deliveryMode: "Offline",
                    instructor: "GV - Nguyễn Minh Tuấn",
                    date: "07/05/2026",
                  },
                  {
                    id: "13",
                    classCode: "SQL-102",
                    deliveryMode: "Online",
                    instructor: "GV - Trần Văn Long",
                    date: "10/05/2026",
                  },
                ],
              },
              {
                id: "6",
                title: "Python cho phân tích dữ liệu",
                classesCount: 2,
                classes: [
                  {
                    id: "14",
                    classCode: "PY-101",
                    deliveryMode: "Offline",
                    instructor: "GV - Lê Thị Hà",
                    date: "15/05/2026",
                  },
                  {
                    id: "15",
                    classCode: "PY-101",
                    deliveryMode: "Live",
                    instructor: "GV - Lê Thị Hà",
                    date: "17/05/2026",
                  },
                ],
              },
            ],
          },
          {
            id: "4",
            title: "Trực quan hóa dữ liệu",
            coursesCount: 2,
            courses: [
              {
                id: "7",
                title: "Power BI cho doanh nghiệp",
                classesCount: 3,
                classes: [
                  {
                    id: "16",
                    classCode: "BI-101",
                    deliveryMode: "Online",
                    instructor: "GV - Phạm Văn Minh",
                    date: "20/05/2026",
                  },
                  {
                    id: "17",
                    classCode: "BI-101",
                    deliveryMode: "Offline",
                    instructor: "GV - Phạm Văn Minh",
                    date: "22/05/2026",
                  },
                  {
                    id: "18",
                    classCode: "BI-102",
                    deliveryMode: "Live",
                    instructor: "GV - Hoàng Thị Kim",
                    date: "25/05/2026",
                  },
                ],
              },
              {
                id: "8",
                title: "Tableau và Data Visualization",
                classesCount: 2,
                classes: [
                  {
                    id: "19",
                    classCode: "TB-101",
                    deliveryMode: "Live",
                    instructor: "GV - Vũ Văn Hùng",
                    date: "28/05/2026",
                  },
                  {
                    id: "20",
                    classCode: "TB-101",
                    deliveryMode: "Online",
                    instructor: "GV - Vũ Văn Hùng",
                    date: "30/05/2026",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "3",
        name: "An ninh mạng và bảo mật thông tin",
        description: "Chương trình nâng cao nhận thức về an ninh mạng và bảo mật thông tin cho toàn bộ nhân viên, giúp phòng ngừa các mối đe dọa an ninh mạng và bảo vệ dữ liệu doanh nghiệp. Các khóa học bao gồm nhận thức về tấn công mạng, GDPR, và các phương pháp quản lý mật khẩu an toàn.",
        startDate: "01/07/2026",
        endDate: "31/08/2026",
        topicsCount: 2,
        topics: [
          {
            id: "5",
            title: "An ninh mạng cơ bản",
            coursesCount: 2,
            courses: [
              {
                id: "9",
                title: "Nhận thức về an ninh mạng",
                classesCount: 2,
                classes: [
                  {
                    id: "21",
                    classCode: "SEC-101",
                    deliveryMode: "Offline",
                    instructor: "GV - Nguyễn Thị Lan",
                    date: "05/07/2026",
                  },
                  {
                    id: "22",
                    classCode: "SEC-101",
                    deliveryMode: "Live",
                    instructor: "GV - Nguyễn Thị Lan",
                    date: "07/07/2026",
                  },
                ],
              },
              {
                id: "10",
                title: "Phòng chống tấn công mạng",
                classesCount: 3,
                classes: [
                  {
                    id: "23",
                    classCode: "SEC-102",
                    deliveryMode: "Online",
                    instructor: "GV - Trần Minh Quân",
                    date: "10/07/2026",
                  },
                  {
                    id: "24",
                    classCode: "SEC-102",
                    deliveryMode: "Offline",
                    instructor: "GV - Trần Minh Quân",
                    date: "12/07/2026",
                  },
                  {
                    id: "25",
                    classCode: "SEC-103",
                    deliveryMode: "Live",
                    instructor: "GV - Lê Văn Đức",
                    date: "15/07/2026",
                  },
                ],
              },
            ],
          },
          {
            id: "6",
            title: "Bảo mật dữ liệu và quyền riêng tư",
            coursesCount: 2,
            courses: [
              {
                id: "11",
                title: "GDPR và bảo vệ dữ liệu cá nhân",
                classesCount: 2,
                classes: [
                  {
                    id: "26",
                    classCode: "GDPR-101",
                    deliveryMode: "Live",
                    instructor: "GV - Phạm Thị Hương",
                    date: "20/07/2026",
                  },
                  {
                    id: "27",
                    classCode: "GDPR-101",
                    deliveryMode: "Online",
                    instructor: "GV - Phạm Thị Hương",
                    date: "22/07/2026",
                  },
                ],
              },
              {
                id: "12",
                title: "Quản lý mật khẩu và xác thực",
                classesCount: 2,
                classes: [
                  {
                    id: "28",
                    classCode: "PWD-101",
                    deliveryMode: "Offline",
                    instructor: "GV - Hoàng Văn Tâm",
                    date: "25/07/2026",
                  },
                  {
                    id: "29",
                    classCode: "PWD-101",
                    deliveryMode: "Live",
                    instructor: "GV - Hoàng Văn Tâm",
                    date: "27/07/2026",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
};


