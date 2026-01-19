// ============================================================================
// Fragment Queries
// ============================================================================

const selectResource = `
  id,
  path,
  size,
  kind,
  mime_type,
  name
`;

const selectMetadata = `
  id,
  class_session_id,
  key,
  value
`;

const selectProfile = `
  id,
  full_name,
  email,
  employee_id,
  avatar
`;

const selectEmployee = `
  id,
  employee_type,
  employee_code,
  profile:profiles(${selectProfile})
`;

const selectCategory = `
  id,
  name,
  slug
`;

const selectHashTag = `
  id,
  name,
  slug,
  type
`;

const selectCourse = `
  id,
  title,
  slug
`;

const selectCourseWithLessonSectionCount = `
  id,
  title,
  slug,
  sections_count:sections(count),
  lessons_count:sections(
    lessons(count)
  )
`;

const selectAssignment = `
  id,
  name
`;

const selectQRCode = `
  id,
  class_room_id,
  class_session_id,
  checkin_start_time,
  checkin_end_time
`;

const selectAgenda = `
  id,
  title,
  description,
  thumbnail_url,
  start_at,
  end_at,
  class_session_id
`;

const selectCertificateTemplate = `
  id,
  name,
  layout_config,
  frame:certificate_frames(
    id,
    image_url
  )
`;

const selectCoursePeriod = `
  id,
  start_at,
  end_at,
	weekly_schedule,
	course:courses(${selectCourse}),
  teacher:employees(${selectEmployee})
`;

const selectSession = `
  id,
  title,
  description,
  start_at,
  end_at,
  class_room_id,
  location,
  channel_provider,
  channel_info,
  priority,
  session_type,
	weekly_schedule,
  courses_period:class_sessions_courses_period(${selectCoursePeriod}),
  session_assignments:class_session_assignment(
    id,
    assignments(${selectAssignment})
  ),
  agendas:class_sessions_agendas(${selectAgenda}),
  metadata:class_session_metadata(${selectMetadata}),
  class_qr_codes(${selectQRCode})
`;

// ============================================================================
// Main Queries
// ============================================================================

export const SELECT_CLASSROOM_DETAIL = `
  id,
  title,
  slug,
  description,
  room_type,
  thumbnail_url,
	class_type,
  start_at,
  end_at,
  status,
  employee_id,
  class_room_metadata(id, key, value, class_room_id),
  class_rooms_resources(
    id,
    resource:resources(${selectResource})
  ),
  class_hash_tag(
    id,
    hash_tags(${selectHashTag})
  ),
  class_room_field(
    id,
    categories(${selectCategory})
  ),
  employees:class_room_employee(
    id,
    employee:employees(${selectEmployee})
  ),
  owner:employees(${selectEmployee}),
  organization:organizations(
    id,
    name
  ),
  resources:class_rooms_resources(
    id,
    resource:resources(${selectResource})
  ),
  sessions:class_sessions(${selectSession}),
  certificate:class_room_certificate_templates(
    id,
    certificate_template_id,
    certificate_template:certificate_templates(${selectCertificateTemplate})
  )
`;

export const SELECT_CLASSROOM_DETAIL_BY_SLUG = `
      id,
      title,
      slug,
      description,
      room_type,
      thumbnail_url,
      start_at,
      end_at,
      status,
      employee_id,
      class_room_metadata(id, key, value, class_room_id),
      class_rooms_resources(
        id,
        resource:resources(${selectResource})
      ),
      class_hash_tag(
        id,
        hash_tags(${selectHashTag})
      ),
      class_room_field(
        id,
        categories(${selectCategory})
      ),
      employees:class_room_employee(
        id,
        employee:employees(${selectEmployee})
      ),
      owner:employees(${selectEmployee}),
      organization:organizations(
        id,
        name
      ),
      resources:class_rooms_resources(
        id,
        resource:resources(${selectResource})
      ),
      sessions:class_sessions(
          id,
          title,
          description,
          start_at,
          end_at,
          class_room_id,
          location,
          channel_provider,
          channel_info,
          priority,
          session_type,
          weekly_schedule,
          courses_period:class_sessions_courses_period(
            id,
            start_at,
            end_at,
            weekly_schedule,
            course:courses(${selectCourseWithLessonSectionCount}),
            teacher:employees(${selectEmployee})
          ),
          session_assignments:class_session_assignment(
            id,
            assignments(${selectAssignment})
          ),
          agendas:class_sessions_agendas(${selectAgenda}),
          metadata:class_session_metadata(${selectMetadata}),
          class_qr_codes(${selectQRCode})	
      )
    `;
