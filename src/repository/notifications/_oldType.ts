export enum NotificationType {
  CLASS_ASSIGNED_STUDENT = "CLASS_ASSIGNED_STUDENT",
  CLASS_UNASSIGNED_STUDENT = "CLASS_UNASSIGNED_STUDENT",
  CLASS_CHECKIN_SUCCESS = "CLASS_CHECKIN_SUCCESS",
  CLASS_REMINDER = "CLASS_REMINDER",
  CLASS_STARTED = "CLASS_STARTED",
  COURSE_ASSIGNED_TEACHER = "COURSE_ASSIGNED_TEACHER",
  COURSE_UNASSIGNED_TEACHER = "COURSE_UNASSIGNED_TEACHER",
  COURSE_ACCESS_EXPIRING = "COURSE_ACCESS_EXPIRING",
  COURSE_ACCESS_EXPIRED = "COURSE_ACCESS_EXPIRED",
  EXAM_ASSIGNED_STUDENT = "EXAM_ASSIGNED_STUDENT",
  EXAM_UNASSIGNED_STUDENT = "EXAM_UNASSIGNED_STUDENT",
  EXAM_REMINDER_STUDENT = "EXAM_REMINDER_STUDENT",
  EXAM_STARTED = "EXAM_STARTED",
  EXAM_EXPIRED = "EXAM_EXPIRED",
  EXAM_SUBMISSION_RECEIVED = "EXAM_SUBMISSION_RECEIVED",
  EXAM_GRADING_COMPLETED = "EXAM_GRADING_COMPLETED",
}

export interface SendNotificationRequest<MetaDataType = Record<string, any>> {
  userId: string;
  type: NotificationType | string;
  title: string;
  userEmail?: string;
  userName?: string;
  metadata?: MetaDataType;
}

export interface SendNotificationResponse extends Record<string, any> {}

export interface SendBulkNotificationsRequest {
  notifications: SendNotificationRequest[];
}

export interface SendBulkNotificationsResponse extends Record<string, any> {}
