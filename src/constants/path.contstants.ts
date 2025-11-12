export const PATHS = {
  ROOT: "/",
  DASHBOARD: "/dashboard",
  ANALYTIC: "/analytic",
  ORGANIZATION: "/organization",
  DEPARTMENTS: {
    ROOT: "/department/departments",
    CREATE_DEPARTMENT: "/department/departments/create",
    IMPORT_DEPARTMENTS: "/department/departments/import",
  },
  BRANCHES: {
    ROOT: "/department/branches",
    CREATE_BRANCH: "/department/branches/create",
    IMPORT_BRANCHES: "/department/branches/import",
  },
  EMPLOYEES: {
    ROOT: "/employees",
    EMPLOYEES_ID: (id: string = ":id") => `/employees/${id}`,
    CREATE_EMPLOYEE: "/employees/create",
    IMPORT_EMPLOYEES: "/employees/import",
  },
  ROLE: {
    ROOT: "/roles",
    ROLES_ID: (id: string = ":id") => `/roles/${id}`,
    CREATE: "/roles/create",
  },
  CLASSROOMS: {
    ROOT: "/admin/class-room",
    CREATE_CLASSROOM: "/admin/class-room/create",
    EDIT_CLASSROOM: (id: string = ":id") => `/admin/class-room/${id}/cedit`,
    LIST_CLASSROOM: "/admin/class-room/list",
  },
  COURSES: {
    ROOT: "/admin/online-course",
    CREATE: "/admin/online-course/create",
    EDIT: (id: string = ":id") => `/admin/online-course/${id}/cedit`,
  },
  STUDENTS: {
    ROOT: "/my-class",
  },
  ASSIGNMENTS: {
    ROOT: "/assignments",
    CREATE_ASSIGNMENT: "/assignments/create",
    EDIT_ASSIGNMENT: (id: string = ":id") => `/assignments/edit/${id}`,
    STUDENTS: (id: string = ":id") => `/assignments/${id}/students`,
    SUBMIT: (id: string = ":id", employeeId: string = ":employeeId") => `/assignments/${id}/submit/${employeeId}`,
    RESULT: (id: string = ":id", employeeId: string = ":employeeId") => `/assignments/${id}/result/${employeeId}`,
  },
  MY_ASSIGNMENTS: {
    ROOT: "/my-assignments",
    STUDENTS: (id: string = ":id") => `/my-assignments/${id}/students`,
    SUBMIT: (id: string = ":id", employeeId: string = ":employeeId") => `/my-assignments/${id}/submit/${employeeId}`,
    RESULT: (id: string = ":id", employeeId: string = ":employeeId") => `/my-assignments/${id}/result/${employeeId}`,
  },
  REPORTS: {
    ROOT: "/report",
    OVER_VIEW: "/report/overview",
  },
};
