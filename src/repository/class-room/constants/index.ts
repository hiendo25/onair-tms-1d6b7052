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
  creator:employees!class_rooms_created_by_fkey (
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
          session_type
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
        employee_departments (
          id,
          department_id,
          departments (
            id,
            name,
            branch_id
          )
        ),
        employee_branches (
          id,
          branch_id,
          branches (
            id,
            name
          )
        ),
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
