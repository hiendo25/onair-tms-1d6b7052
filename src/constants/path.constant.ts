export const PATHS = {
  ROOT: "/",
  DASHBOARD: "/dashboard",
  ANALYTIC: "/analytic",
  ORGANIZATION: "/organization",
  DEPARTMENTS: {
    ROOT: "/department/departments",
    CREATE_DEPARTMENT: "/department/departments/create",
    IMPORT_DEPARTMENTS: "/department/departments/import",
    DETAIL: (id: string = ":id") => `/department/departments/${id}`,
  },
  BRANCHES: {
    ROOT: "/department/branches",
    CREATE_BRANCH: "/department/branches/create",
    IMPORT_BRANCHES: "/department/branches/import",
    DETAIL: (id: string = ":id") => `/department/branches/${id}`,
  },
  EMPLOYEES: {
    ROOT: "/admin/employees",
    EMPLOYEES_ID: (id: string = ":id") => `/admin/employees/${id}`,
    CREATE_EMPLOYEE: "/admin/employees/create",
    IMPORT_EMPLOYEES: "/admin/employees/import",
  },
  ROLE: {
    ROOT: "/admin/roles",
    ROLES_ID: (id: string = ":id") => `/admin/roles/${id}`,
    CREATE: "/admin/roles/create",
  },
  CLASSROOMS: {
    ROOT: "/admin/class-room",
    CREATE_CLASSROOM: "/admin/class-room/create",
    EDIT_CLASSROOM: (id: string = ":id") => `/admin/class-room/${id}/edit`,
    DETAIL_CLASSROOM: (slug: string) => `/class-room/${slug}`,
    COUNTDOWN_CLASSROOM: (slug: string, sessionId: string) => `/class-room/cd/${slug}/${sessionId}`,
    LIST_CLASSROOM: "/admin/class-room/list",
  },
  COURSES: {
    ROOT: "/admin/online-course",
    CREATE: "/admin/online-course/create",
    LIST: "/admin/online-course/list",
    STUDENTS: (courseId: string = ":courseId") => `/admin/online-course/${courseId}/students`,
    EDIT: (id: string = ":id") => `/admin/online-course/${id}/edit`,
  },
  STUDENTS: {
    ROOT: "/my-class",
    LEARNINNG: (courseId: string) => `/my-class/learning-screen/${courseId}`,
  },
  ASSIGNMENTS: {
    ROOT: "/admin/assignments",
    CREATE_ASSIGNMENT: "/admin/assignments/create",
    EDIT_ASSIGNMENT: (id: string = ":id") => `/admin/assignments/edit/${id}`,
    STUDENTS: (id: string = ":id") => `/admin/assignments/${id}/students`,
    SUBMIT: (id: string = ":id", employeeId: string = ":employeeId") => `/admin/assignments/${id}/submit/${employeeId}`,
    GRADE: (id: string = ":id", employeeId: string = ":employeeId") => `/admin/assignments/${id}/grade/${employeeId}`,
    RESULT: (id: string = ":id", employeeId: string = ":employeeId") => `/admin/assignments/${id}/result/${employeeId}`,
  },
  MY_ASSIGNMENTS: {
    ROOT: "/my-assignments",
    STUDENTS: (id: string = ":id") => `/my-assignments/${id}/students`,
    SUBMIT: (id: string = ":id", employeeId: string = ":employeeId") => `/my-assignments/${id}/submit/${employeeId}`,
    RESULT: (id: string = ":id", employeeId: string = ":employeeId") => `/my-assignments/${id}/result/${employeeId}`,
  },
  REPORTS: {
    ROOT: "/admin/report",
    OVER_VIEW: "/admin/report/overview",
  },
  SURVEYS: {
    ROOT: "/admin/surveys",
    CREATE: "/admin/surveys/create",
    LIST: "/admin/surveys/list",
    EDIT: (id: string = ":id") => `/admin/surveys/${id}/edit`,
    STATISTICS: (id: string = ":id") => `/admin/surveys/${id}/statistics`,
    SUBMIT: (id: string = ":id") => `/surveys/${id}/submit`,
    THANK_YOU: (id: string = ":id") => `/surveys/${id}/submit/thank-you`,
  },
  PLANS: {
    ROOT: "/admin/plans",
    CREATE: "/admin/plans/create",
    DETAIL: (id: string = ":id") => `/admin/plans/${id}`,
    EDIT: (id: string = ":id") => `/admin/plans/${id}/edit`,
  },
  LEARNING_PATHS: {
    ROOT: "/admin/learning-paths",
    CREATE: "/admin/learning-paths/create",
    EDIT: (id: string = ":id") => `/admin/learning-paths/edit/${id}`,
  },
  MY_LEARNING_PATHS: "/learning-paths",
} as const;

export const AUTH_PATHS = {
  SIGNIN: "/auth/signin",
  SIGNUP: "/auth/signup",
} as const;
