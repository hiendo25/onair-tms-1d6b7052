export enum ClassRoomRuntimeStatusFilter {
  All = "all",
  Ongoing = "ongoing",
  Today = "today",
  Upcoming = "upcoming",
  Past = "past",
  Draft = "draft",
}

export enum ClassRoomTypeFilter {
  All = "all",
  Single = "single",
  Multiple = "multiple"
}

export enum ClassSessionModeFilter {
  All = "all",
  Online = "online",
  Offline = "offline",
}

export enum ClassRoomStatusFilter {
  All = "all",
  Daft = "draft",
  Publish = "publish",
  Active = "active",
  Pending = "pending",
  Deactive = "deactive",
  Deleted = "deleted",
};

export type AttendanceStatus = "attended" | "absent" | "pending";
export interface ClassRoomFilters {
  type: ClassRoomTypeFilter;
  sessionMode: ClassSessionModeFilter;
  search: string;
  startDate?: string | null;
  endDate?: string | null;
  runtimeStatus: ClassRoomRuntimeStatusFilter;
  status: ClassRoomStatusFilter;
}

export interface ElearningFilters {
  search: string;
}
