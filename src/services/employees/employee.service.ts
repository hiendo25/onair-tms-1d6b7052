import {
  assignmentResultsRepository,
  assignmentsRepository,
  classRoomRepository,
  classRoomSessionRepository,
  coursesRepository,
  employeeBranchesRepository,
  employeeDepartmentsRepository,
  employeesRepository,
  libraryRepository,
  managersEmployeesRepository,
  organizationsRepository,
  profilesRepository,
  qrAttendanceRepository,
  userPreferenceRepository,
} from "@/repository";
import { createSVClient } from "@/services/supabase/server";
import { createServiceRoleClient } from "@/services/supabase/service-role-client";
import type { CreateEmployeeDto, EmployeeDto, GetEmployeesParams, UpdateEmployeeDto } from "@/types/dto/employees";
import type { PaginatedResult } from "@/types/dto/pagination.dto";
import { createClient } from "../supabase/client";

interface CreateEmployeeResult {
  userId: string;
  employeeId: string;
  employeeCode: string;
  profileId: string;
}

async function createEmployeeCore(payload: CreateEmployeeDto, organizationId: string): Promise<CreateEmployeeResult> {
  let userId: string | null = null;
  let employeeId: string | null = null;
  let profileId: string | null = null;

  try {
    const adminSupabase = await createServiceRoleClient();
    const temporaryPassword = "123456";

    const { data, error } = await adminSupabase.rpc("get_user_id_by_email", { user_email: payload.email });

    if (!data) {
      const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
        email: payload.email,
        password: temporaryPassword,
        email_confirm: true,
        app_metadata: {
          active_organization_id: organizationId,
        },
      });
      if (authError || !authData.user) {
        throw new Error(`Failed to create auth user: ${authError?.message || "Unknown error"}`);
      }
      userId = authData.user.id;
      console.log(`Auth user created: ${userId}`);
    } else {
      userId = data;
    }

    let employeeCode = payload.employee_code;
    let employeeOrder: number;

    const lastOrder = await employeesRepository.getLastEmployeeOrder();

    if (!employeeCode || employeeCode.trim() === "") {
      employeeOrder = lastOrder + 1;
      employeeCode = String(employeeOrder).padStart(5, "0");
    } else {
      employeeOrder = lastOrder + 1;
    }

    const employeeData = await employeesRepository.createEmployee({
      user_id: userId,
      employee_code: employeeCode,
      employee_order: employeeOrder,
      start_date: payload.start_date,
      position_id: payload.position_id || null,
      employee_type: payload.employee_type,
      organization_id: organizationId,
      status: "active",
    });

    employeeId = employeeData.id;
    console.log(`Employee record created: ${employeeId}`);

    const profileData = await profilesRepository.createProfile({
      employee_id: employeeId,
      email: payload.email,
      full_name: payload.full_name,
      phone_number: payload.phone_number,
      gender: payload.gender,
      birthday: payload.birthday,
    });

    profileId = profileData.id;
    console.log(`Profile record created: ${profileId}`);

    // Create employee-department relationship
    if (payload.department) {
      await employeeDepartmentsRepository.create([
        {
          employee_id: employeeId,
          department_id: payload.department,
        },
      ]);
      console.log("Created employee-department relationship");
    }

    // Create employee-branch relationship
    if (payload.branch) {
      await employeeBranchesRepository.create([
        {
          employee_id: employeeId,
          branch_id: payload.branch,
        },
      ]);
      console.log("Created employee-branch relationship");
    }

    if (payload.manager_id) {
      await managersEmployeesRepository.createManagerRelationship({
        employee_id: employeeId,
        manager_id: payload.manager_id,
      });
      console.log("Manager relationship created");
    }
    if (payload.role_id) {
      await adminSupabase.from("user_roles").delete().eq("user_id", userId);

      const { error: roleError } = await adminSupabase.from("user_roles").insert([
        {
          user_id: userId,
          role_id: payload.role_id,
        },
      ]);

      if (roleError) throw new Error(`Failed to assign role to user: ${roleError.message}`);
    }

    const { data: currentReferenceData, error: currentReferenceError } =
      await userPreferenceRepository.getUserPreferencesByUserId(userId);

    if (currentReferenceError) {
      throw new Error(currentReferenceError.message);
    }

    if (!currentReferenceData) {
      const { error: referenceError } = await userPreferenceRepository.createUserPreference({
        user_id: userId,
        default_organization_id: organizationId,
      });

      if (referenceError) {
        throw new Error(referenceError.message);
      }
    }

    return {
      userId,
      employeeId,
      employeeCode,
      profileId,
    };
  } catch (error) {
    console.error("Error during employee creation, initiating rollback...");
    console.error("Service layer error:", error);

    if (profileId && employeeId) {
      console.log(`Rolling back: Deleting profile ${profileId}`);
      await profilesRepository.deleteProfileByEmployeeId(employeeId);
    }

    if (employeeId) {
      console.log(`Rolling back: Deleting employee-branch relations for employee ${employeeId}`);
      await employeeBranchesRepository.deleteByEmployeeId(employeeId);

      console.log(`Rolling back: Deleting employee-department relations for employee ${employeeId}`);
      await employeeDepartmentsRepository.deleteByEmployeeId(employeeId);

      console.log(`Rolling back: Deleting manager relationships for employee ${employeeId}`);
      await managersEmployeesRepository.deleteManagerRelationshipsByEmployeeId(employeeId);

      console.log(`Rolling back: Deleting employee ${employeeId}`);
      await employeesRepository.deleteEmployeeById(employeeId);
    }

    if (userId) {
      console.log(`Rolling back: Deleting auth user ${userId}`);
      const adminSupabase = await createServiceRoleClient();
      await adminSupabase.auth.admin.deleteUser(userId);
    }

    console.log("Rollback completed (service layer)");

    throw error;
  }
}

// async function createEmployeeWithRelations(payload: CreateEmployeeDto): Promise<CreateEmployeeResult> {
//   // const supabase = await createSVClient();
//   // const {
//   //   data: { user: currentUser },
//   //   error: userError,
//   // } = await supabase.auth.getUser();

//   // if (userError || !currentUser) {
//   //   throw new Error(`Failed to get current user: ${userError?.message || "User not authenticated"}`);
//   // }

//   // const organizationId = await employeesRepository.getEmployeeOrganizationIdByUserId(currentUser.id);
//   // console.log(`Creating employee in organization: ${organizationId}`);

//   return createEmployeeCore(payload, payload.organizationId);
// }

async function updateEmployeeWithRelations(payload: UpdateEmployeeDto): Promise<void> {
  await employeesRepository.updateEmployeeById(payload.id, {
    employee_code: payload.employee_code,
    start_date: payload.start_date ?? undefined,
    position_id: payload.position_id || null,
    employee_type: payload.employee_type,
  });

  await profilesRepository.updateProfileByEmployeeId(payload.id, {
    full_name: payload.full_name,
    email: payload.email,
    phone_number: payload.phone_number || "",
    gender: payload.gender,
    birthday: payload.birthday || null,
  });

  // Delete existing relationships
  await employeeBranchesRepository.deleteByEmployeeId(payload.id);
  await employeeDepartmentsRepository.deleteByEmployeeId(payload.id);

  // Create new employee-department relationship
  if (payload.department) {
    await employeeDepartmentsRepository.create([
      {
        employee_id: payload.id,
        department_id: payload.department,
      },
    ]);
  }

  // Create new employee-branch relationship
  if (payload.branch) {
    await employeeBranchesRepository.create([
      {
        employee_id: payload.id,
        branch_id: payload.branch,
      },
    ]);
  }

  await managersEmployeesRepository.deleteManagerRelationshipsByEmployeeId(payload.id);

  if (payload.manager_id) {
    await managersEmployeesRepository.createManagerRelationship({
      employee_id: payload.id,
      manager_id: payload.manager_id,
    });
  }

  if (payload.role_id) {
    const adminSupabase = await createServiceRoleClient();
    const employee = await employeesRepository.getEmployeeById(payload.id);
    await adminSupabase.from("user_roles").delete().eq("user_id", employee.user_id);

    const { error: roleError } = await adminSupabase.from("user_roles").insert([
      {
        user_id: employee.user_id,
        role_id: payload.role_id,
      },
    ]);
    if (roleError) throw new Error(`Failed to assign role to user: ${roleError.message}`);
  }
}

async function deleteEmployeeWithRelations(employeeId: string): Promise<void> {
  const userId = await employeesRepository.getEmployeeUserId(employeeId);

  // Delete assignment-related relationships (child records first, then parent)
  await assignmentResultsRepository.deleteAssignmentResultsByEmployeeId(employeeId);
  await assignmentsRepository.deleteAssignmentEmployeesByEmployeeId(employeeId);
  await assignmentsRepository.deleteQuestionsByEmployeeId(employeeId);
  await assignmentsRepository.deleteAssignmentCategoriesByEmployeeId(employeeId);
  await assignmentsRepository.deleteAssignmentsByEmployeeId(employeeId);

  // Delete class-related relationships
  await qrAttendanceRepository.deleteAttendancesByEmployeeId(employeeId);
  await qrAttendanceRepository.deleteQRCodesByEmployeeId(employeeId);
  await classRoomRepository.deleteAllClassRoomEmployeesByEmployeeId(employeeId);
  await classRoomSessionRepository.deleteClassSessionTeachersByEmployeeId(employeeId);
  await classRoomRepository.deleteClassRoomsByEmployeeId(employeeId);

  // Delete course-related relationships
  await coursesRepository.deleteCoursesByEmployeeId(employeeId);

  // Delete library-related relationships
  await libraryRepository.softDeleteResourcesByEmployeeId(employeeId);
  await libraryRepository.deleteLibraryByEmployeeId(employeeId);

  // Delete core employee relationships
  await managersEmployeesRepository.deleteAllManagerRelationshipsForEmployee(employeeId);
  await employeeBranchesRepository.deleteByEmployeeId(employeeId);
  await employeeDepartmentsRepository.deleteByEmployeeId(employeeId);
  await profilesRepository.deleteProfileByEmployeeId(employeeId);
  await employeesRepository.deleteEmployeeById(employeeId);

  // Delete auth user
  const adminSupabase = await createServiceRoleClient();
  const { error: authError } = await adminSupabase.auth.admin.deleteUser(userId);

  if (authError) {
    console.error(`Warning: Failed to delete auth user: ${authError.message}`);
  }
}

async function getEmployees(params?: GetEmployeesParams): Promise<PaginatedResult<EmployeeDto>> {
  return employeesRepository.getEmployees(params);
}

async function getEmployeeById(id: string): Promise<EmployeeDto> {
  return employeesRepository.getEmployeeById(id);
}

export {
  createEmployeeCore,
  // createEmployeeWithRelations,
  updateEmployeeWithRelations,
  deleteEmployeeWithRelations,
  getEmployees,
  getEmployeeById,
};
