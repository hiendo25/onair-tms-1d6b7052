export const PAGE = 1;
export const LIMIT = 9;


export const CLASS_ROOMS_SELECT = `
  *,
  class_sessions!inner (
    *,
    teacherAssignments:class_session_teacher (
      id,
      teacher_id,
      teacher:employees (
        id,
        employee_code,
        employee_type,
        profile:profiles (
          id,
          full_name,
          email,
          phone_number,
          avatar
        )
      )
    )
  ),
  studentCount:class_room_employee(count),
  assignees:class_room_employee (
    id,
    employee_id,
    employee:employees (
      id,
      employee_type
    )
  ),
  creator:employees!class_rooms_employee_id_fkey (
    id,
    employee_code,
    employee_type,
    profile:profiles (
      full_name,
      email,
      phone_number
    )
  )
`;

export const CLASS_SESSION_WITH_CLASS_ROOM_SELECT = `
  id,
  title,
  description,
  start_at,
  end_at,
  channel_info,
  channel_provider,
  class_room_id,
  is_online,
  limit_person,
  class_room:class_rooms!inner (
    id,
    title,
    description,
    slug,
    thumbnail_url,
    start_at,
    end_at,
    room_type,
    status,
    organization_id,
    employee_id,
    assignees:class_room_employee (
      id,
      employee_id,
      employee:employees (
        id,
        employee_type
      )
    )
  ),
  teacherAssignments:class_session_teacher (
    id,
    teacher_id,
    teacher:employees (
      id,
      employee_code,
      employee_type,
      profile:profiles (
        id,
        full_name,
        email,
        phone_number,
        avatar
      )
    )
  )
`;

export const CLASS_ROOM_STUDENTS_SELECT = `
      id,
      created_at,
      class_rooms_priority!class_room_employee_class_room_id_fkey (
        runtime_status
      ),
      class_rooms!inner (
        sessions:class_sessions!inner (
          id,
          title,
          start_at,
          end_at,
          is_online
        )
      ),
      employee:employees!inner (
        id,
        employee_code,
        employee_type,
        status,
        profile:profiles!inner (
          id,
          full_name,
          email,
          phone_number,
          avatar
        ),
        employments (
          id,
          organization_unit_id,
          organizationUnit:organization_units!employments_organization_unit_id_fkey (
            id,
            name,
            type
          )
        ),
        branchEmployments:employments!inner (organization_unit_id),
        departmentEmployments:employments!inner (organization_unit_id),
        attendances:class_attendances!class_attendances_employee_id_fkey (
          id,
          employee_id,
          class_room_id,
          class_session_id,
          attendance_status,
          attended_at,
          attendance_mode,
          attendance_method
        )
      )
`;
