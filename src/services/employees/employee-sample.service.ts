import { createSVClient } from "@/services/supabase/server";
import { employeesRepository } from "@/repository";
import { getAllOrganizationUnitsWithDetails } from "@/repository/organization-units";

interface SampleEmployeeData {
  employee_code: string;
  full_name: string;
  email: string;
  phone_number: string;
  gender: string;
  birthday: string;
  department: string;
  branch: string;
  start_date: string;
  employee_type: string;
}

const VIETNAMESE_LAST_NAMES = [
  "Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Phan", "Vũ", "Võ", "Đặng", "Bùi",
  "Đỗ", "Hồ", "Ngô", "Dương", "Lý"
];

const VIETNAMESE_MIDDLE_NAMES = [
  "Văn", "Thị", "Hữu", "Đức", "Minh", "Hoàng", "Quốc", "Anh", "Thanh", "Tuấn",
  "Hồng", "Thu", "Mai", "Lan", "Phương"
];

const VIETNAMESE_FIRST_NAMES_MALE = [
  "Hùng", "Dũng", "Cường", "Tuấn", "Minh", "Hoàng", "Khoa", "Long", "Nam", "Phong",
  "Quân", "Sơn", "Tài", "Thắng", "Trung", "Việt", "Hải", "Đạt", "Kiên", "Bảo"
];

const VIETNAMESE_FIRST_NAMES_FEMALE = [
  "Hoa", "Lan", "Mai", "Hương", "Linh", "Nga", "Phương", "Thu", "Trang", "Vy",
  "Anh", "Chi", "Hà", "Hằng", "Nhung", "Thảo", "Thúy", "Tuyết", "Yến", "Diệp"
];

function generateVietnameseName(gender: "male" | "female"): string {
  const lastName = VIETNAMESE_LAST_NAMES[Math.floor(Math.random() * VIETNAMESE_LAST_NAMES.length)];
  const middleName = VIETNAMESE_MIDDLE_NAMES[Math.floor(Math.random() * VIETNAMESE_MIDDLE_NAMES.length)];
  const firstNames = gender === "male" ? VIETNAMESE_FIRST_NAMES_MALE : VIETNAMESE_FIRST_NAMES_FEMALE;
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  
  return `${lastName} ${middleName} ${firstName}`;
}

function generateEmail(fullName: string, index: number): string {
  const nameParts = fullName.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .split(" ");
  
  const lastName = nameParts[0];
  const firstName = nameParts[nameParts.length - 1];
  
  return `${firstName}.${lastName}${index}@company.com`;
}

function generatePhoneNumber(): string {
  const prefixes = ["090", "091", "094", "098", "032", "033", "034", "035", "036", "037", "038", "039"];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 10000000).toString().padStart(7, "0");
  return `${prefix}${suffix}`;
}

function generateBirthday(): string {
  const year = 1985 + Math.floor(Math.random() * 15);
  const month = (1 + Math.floor(Math.random() * 12)).toString().padStart(2, "0");
  const day = (1 + Math.floor(Math.random() * 28)).toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function generateStartDate(): string {
  const year = 2020 + Math.floor(Math.random() * 5);
  const month = (1 + Math.floor(Math.random() * 12)).toString().padStart(2, "0");
  const day = (1 + Math.floor(Math.random() * 28)).toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function generateSampleEmployeeData(count: number): Promise<SampleEmployeeData[]> {
  const supabase = await createSVClient();
  const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();

  if (userError || !currentUser) {
    throw new Error(`Failed to get current user: ${userError?.message || "User not authenticated"}`);
  }

  const organizationId = await employeesRepository.getEmployeeOrganizationIdByUserId(currentUser.id);
  const orgUnits = await getAllOrganizationUnitsWithDetails();

  const departments = orgUnits.filter(unit => unit.type === "department");
  const branches = orgUnits.filter(unit => unit.type === "branch");

  if (departments.length === 0) {
    throw new Error("Không tìm thấy phòng ban nào trong hệ thống. Vui lòng tạo phòng ban trước khi tạo file mẫu.");
  }

  const lastOrder = await employeesRepository.getLastEmployeeOrder();
  const startingOrder = lastOrder + 1;

  const samples: SampleEmployeeData[] = [];

  for (let i = 0; i < count; i++) {
    const gender: "male" | "female" = Math.random() > 0.5 ? "male" : "female";
    const fullName = generateVietnameseName(gender);
    const department = departments[Math.floor(Math.random() * departments.length)];
    const branch = branches.length > 0 ? branches[Math.floor(Math.random() * branches.length)] : null;
    const employeeType: "student" | "teacher" = Math.random() > 0.5 ? "student" : "teacher";

    const employeeOrder = startingOrder + i;
    const employeeCode = String(employeeOrder).padStart(5, "0");

    samples.push({
      employee_code: employeeCode,
      full_name: fullName,
      email: generateEmail(fullName, employeeOrder),
      phone_number: generatePhoneNumber(),
      gender: gender,
      birthday: generateBirthday(),
      department: department.id,
      branch: branch ? branch.id : "",
      start_date: generateStartDate(),
      employee_type: employeeType,
    });
  }

  return samples;
}

export { generateSampleEmployeeData };
export type { SampleEmployeeData };

