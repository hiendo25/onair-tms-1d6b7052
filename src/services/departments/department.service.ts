import { departmentRepository } from "@/repository/department";
import type {
  CreateDepartmentDto,
  DepartmentDto,
  DepartmentImportResult,
  GetDepartmentsParams,
  ImportDepartmentsDto,
  UpdateDepartmentDto,
} from "@/types/dto/departments";
import type { PaginatedResult } from "@/types/dto/pagination.dto";

async function getDepartments(params?: GetDepartmentsParams): Promise<PaginatedResult<DepartmentDto>> {
  return departmentRepository.getList(params);
}

async function getDepartmentById(id: string): Promise<DepartmentDto> {
  return departmentRepository.getById(id);
}

async function createDepartment(payload: CreateDepartmentDto): Promise<DepartmentDto> {
  // Check if name already exists
  const exists = await departmentRepository.checkNameExists(
    payload.name,
    payload.organization_id
  );

  if (exists) {
    throw new Error("Tên phòng ban đã tồn tại");
  }

  return departmentRepository.create(payload);
}

async function updateDepartment(payload: UpdateDepartmentDto): Promise<DepartmentDto> {
  // Check if name already exists (excluding current department)
  if (payload.name) {
    const department = await departmentRepository.getById(payload.id);
    const exists = await departmentRepository.checkNameExists(
      payload.name,
      department.organization_id,
      payload.id
    );

    if (exists) {
      throw new Error("Tên phòng ban đã tồn tại");
    }
  }

  return departmentRepository.update(payload);
}

async function deleteDepartment(id: string): Promise<void> {
  return departmentRepository.delete(id);
}

async function getBranches(organizationId: string) {
  const branches = await departmentRepository.getBranches(organizationId);
  return { data: branches };
}

async function importDepartments(payload: ImportDepartmentsDto): Promise<DepartmentImportResult> {
  const { departments, organizationId } = payload;
  const errors: string[] = [];
  const validDepartments: CreateDepartmentDto[] = [];

  // Validate each department
  for (let i = 0; i < departments.length; i++) {
    const dept = departments[i];
    if (!dept) continue;
    
    const rowNumber = i + 2; // +2 because of header row and 0-index

    if (!dept.name || dept.name.trim() === "") {
      errors.push(`Dòng ${rowNumber}: Tên phòng ban không được để trống`);
      continue;
    }

    // Check for duplicates in the import file
    const duplicateInFile = validDepartments.find(
      (d) => d.name.toLowerCase() === dept.name.toLowerCase()
    );
    if (duplicateInFile) {
      errors.push(`Dòng ${rowNumber}: Tên phòng ban "${dept.name}" bị trùng trong file`);
      continue;
    }

    // Check if name already exists in database
    const exists = await departmentRepository.checkNameExists(
      dept.name,
      organizationId
    );
    if (exists) {
      errors.push(`Dòng ${rowNumber}: Tên phòng ban "${dept.name}" đã tồn tại`);
      continue;
    }

    validDepartments.push({
      name: dept.name,
      organization_id: organizationId,
    });
  }

  // If there are errors, return them without importing
  if (errors.length > 0) {
    return {
      success: false,
      imported: 0,
      failed: errors.length,
      errors,
    };
  }

  // Import valid departments
  try {
    await departmentRepository.bulkImport(validDepartments);
    return {
      success: true,
      imported: validDepartments.length,
      failed: 0,
      errors: [],
    };
  } catch (error) {
    return {
      success: false,
      imported: 0,
      failed: validDepartments.length,
      errors: [`Lỗi khi import: ${error instanceof Error ? error.message : "Unknown error"}`],
    };
  }
}

export {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getBranches,
  importDepartments,
};
