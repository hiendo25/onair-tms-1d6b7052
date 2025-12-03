import * as notificationsRepository from "@/repository/notifications";
import {
  type SendNotificationRequest,
  type SendNotificationResponse,
  NotificationType,
} from "@/repository/notifications/type";

export async function sendEmailNotification(request: SendNotificationRequest): Promise<SendNotificationResponse> {
  try {
    if (!request.userId) {
      console.warn("[Notification] Missing userId in request");
      return { success: false, message: "userId is required" };
    }

    if (!request.type) {
      console.warn("[Notification] Missing type in request");
      return { success: false, message: "type is required" };
    }

    if (!request.userEmail) {
      console.warn("[Notification] Missing userEmail in request");
      return { success: false, message: "userEmail is required" };
    }

    console.log(`[Notification] Sending notification to user ${request.userId}, type: ${request.type}`);

    const result = await notificationsRepository.sendNotification(request);

    if (result.success) {
      console.log(`[Notification] Sent successfully to user ${request.userId}`);
    } else {
      console.error(`[Notification] Failed to send to user ${request.userId}:`, result.message);
    }

    return result;
  } catch (error: any) {
    console.error(`[Notification] Unexpected error:`, error?.message || error);
    return {
      success: false,
      message: error?.message || "Unexpected error while sending notification",
    };
  }
}

export interface ClassAssignedStudentMetaData {
  userName: string;
  className: string;
  teacherName: string;
  dateTime: string;
  classDetailUrl: string;
}

export async function sendClassAssignedStudentNotification(
  userId: string,
  userEmail: string,
  data: ClassAssignedStudentMetaData,
): Promise<SendNotificationResponse> {
  return sendEmailNotification({
    userId,
    userEmail,
    type: NotificationType.CLASS_ASSIGNED_STUDENT,
    title: `Bạn đã được thêm vào lớp học "${data.className}"`,
    metadata: {
      className: data.className,
      teacherName: data.teacherName,
      dateTime: data.dateTime,
      classDetailUrl: data.classDetailUrl,
    },
  });
}

export interface ClassUnassignedStudentMetaData {
  userName: string;
  className: string;
}

export async function sendClassUnassignedStudentNotification(
  userId: string,
  userEmail: string,
  data: ClassUnassignedStudentMetaData,
): Promise<SendNotificationResponse> {
  return sendEmailNotification({
    userId,
    userEmail,
    type: NotificationType.CLASS_UNASSIGNED_STUDENT,
    title: `Bạn đã bị xóa khỏi lớp học "${data.className}"`,
    metadata: {
      className: data.className,
    },
  });
}

export interface ClassCheckinSuccessMetaData {
  userName: string;
  className: string;
  checkinTime: string;
  classDetailUrl: string;
}

export async function sendClassCheckinSuccessNotification(
  userId: string,
  userEmail: string,
  data: ClassCheckinSuccessMetaData,
): Promise<SendNotificationResponse> {
  return sendEmailNotification({
    userId,
    userEmail,
    type: NotificationType.CLASS_CHECKIN_SUCCESS,
    title: `Bạn đã điểm danh thành công cho lớp học "${data.className}"`,
    metadata: {
      className: data.className,
      checkinTime: data.checkinTime,
      classDetailUrl: data.classDetailUrl,
    },
  });
}

export interface ClassReminderMetaData {
  userName: string;
  className: string;
  dateTime: string;
  classDetailUrl: string;
}

export async function sendClassReminderNotification(
  userId: string,
  userEmail: string,
  data: ClassReminderMetaData,
): Promise<SendNotificationResponse> {
  return sendEmailNotification({
    userId,
    userEmail,
    type: NotificationType.CLASS_REMINDER,
    title: `Nhắc nhở: Lớp học "${data.className}" sắp diễn ra`,
    metadata: {
      className: data.className,
      dateTime: data.dateTime,
      classDetailUrl: data.classDetailUrl,
    },
  });
}

export interface ClassStartedMetaData {
  userName: string;
  className: string;
  classDetailUrl: string;
}

export async function sendClassStartedNotification(
  userId: string,
  userEmail: string,
  data: ClassStartedMetaData,
): Promise<SendNotificationResponse> {
  return sendEmailNotification({
    userId,
    userEmail,
    type: NotificationType.CLASS_STARTED,
    title: `Lớp học "${data.className}" đã bắt đầu`,
    metadata: {
      className: data.className,
      classDetailUrl: data.classDetailUrl,
    },
  });
}

export interface CourseAssignedTeacherMetaData {
  userName: string;
  courseName: string;
  courseAccessUrl: string;
}

export async function sendCourseAssignedTeacherNotification(
  userId: string,
  userEmail: string,
  data: CourseAssignedTeacherMetaData,
): Promise<SendNotificationResponse> {
  return sendEmailNotification({
    userId,
    userEmail,
    type: NotificationType.COURSE_ASSIGNED_TEACHER,
    title: `Bạn đã được giao giảng dạy khóa học "${data.courseName}"`,
    metadata: {
      courseName: data.courseName,
      courseAccessUrl: data.courseAccessUrl,
    },
  });
}

export interface CourseUnassignedTeacherMetaData {
  userName: string;
  courseName: string;
}

export async function sendCourseUnassignedTeacherNotification(
  userId: string,
  userEmail: string,
  data: CourseUnassignedTeacherMetaData,
): Promise<SendNotificationResponse> {
  return sendEmailNotification({
    userId,
    userEmail,
    type: NotificationType.COURSE_UNASSIGNED_TEACHER,
    title: `Bạn đã bị gỡ khỏi giảng dạy khóa học "${data.courseName}"`,
    metadata: {
      courseName: data.courseName,
    },
  });
}

export interface CourseAccessExpiringMetaData {
  userName: string;
  courseName: string;
  expiryDate: string;
  courseAccessUrl: string;
}

export async function sendCourseAccessExpiringNotification(
  userId: string,
  userEmail: string,
  data: CourseAccessExpiringMetaData,
): Promise<SendNotificationResponse> {
  return sendEmailNotification({
    userId,
    userEmail,
    type: NotificationType.COURSE_ACCESS_EXPIRING,
    title: `Truy cập khóa học "${data.courseName}" của bạn sắp hết hạn`,
    metadata: {
      courseName: data.courseName,
      expiryDate: data.expiryDate,
      courseAccessUrl: data.courseAccessUrl,
    },
  });
}

export interface CourseAccessExpiredMetaData {
  userName: string;
  courseName: string;
}

export async function sendCourseAccessExpiredNotification(
  userId: string,
  userEmail: string,
  data: CourseAccessExpiredMetaData,
): Promise<SendNotificationResponse> {
  return sendEmailNotification({
    userId,
    userEmail,
    type: NotificationType.COURSE_ACCESS_EXPIRED,
    title: `Truy cập khóa học "${data.courseName}" của bạn đã hết hạn`,
    metadata: {
      courseName: data.courseName,
    },
  });
}

export interface ExamAssignedStudentMetaData {
  userName: string;
  examName: string;
  assignedBy: string;
  deadline: string;
  examUrl: string;
}

export async function sendExamAssignedStudentNotification(
  userId: string,
  userEmail: string,
  data: ExamAssignedStudentMetaData,
): Promise<SendNotificationResponse> {
  return sendEmailNotification({
    userId,
    userEmail,
    type: NotificationType.EXAM_ASSIGNED_STUDENT,
    title: `Bạn đã được giao bài kiểm tra "${data.examName}"`,
    metadata: {
      examName: data.examName,
      assignedBy: data.assignedBy,
      deadline: data.deadline,
      examUrl: data.examUrl,
    },
  });
}

export interface ExamUnassignedStudentMetaData {
  userName: string;
  examName: string;
}

export async function sendExamUnassignedStudentNotification(
  userId: string,
  userEmail: string,
  data: ExamUnassignedStudentMetaData,
): Promise<SendNotificationResponse> {
  return sendEmailNotification({
    userId,
    userEmail,
    type: NotificationType.EXAM_UNASSIGNED_STUDENT,
    title: `Bạn đã bị gỡ khỏi bài kiểm tra "${data.examName}"`,
    metadata: {
      examName: data.examName,
    },
  });
}

export interface ExamReminderStudentMetaData {
  userName: string;
  examName: string;
  deadline: string;
  examUrl: string;
}

export async function sendExamReminderStudentNotification(
  userId: string,
  userEmail: string,
  data: ExamReminderStudentMetaData,
): Promise<SendNotificationResponse> {
  return sendEmailNotification({
    userId,
    userEmail,
    type: NotificationType.EXAM_REMINDER_STUDENT,
    title: `Nhắc nhở: Bài kiểm tra "${data.examName}" sắp đến hạn`,
    metadata: {
      examName: data.examName,
      deadline: data.deadline,
      examUrl: data.examUrl,
    },
  });
}

export interface ExamStartedMetaData {
  userName: string;
  examName: string;
  examUrl: string;
}

export async function sendExamStartedNotification(
  userId: string,
  userEmail: string,
  data: ExamStartedMetaData,
): Promise<SendNotificationResponse> {
  return sendEmailNotification({
    userId,
    userEmail,
    type: NotificationType.EXAM_STARTED,
    title: `Bài kiểm tra "${data.examName}" đã bắt đầu`,
    metadata: {
      examName: data.examName,
      examUrl: data.examUrl,
    },
  });
}

export interface ExamExpiredMetaData {
  userName: string;
  examName: string;
}

export async function sendExamExpiredNotification(
  userId: string,
  userEmail: string,
  data: ExamExpiredMetaData,
): Promise<SendNotificationResponse> {
  return sendEmailNotification({
    userId,
    userEmail,
    type: NotificationType.EXAM_EXPIRED,
    title: `Bài kiểm tra "${data.examName}" đã hết hạn`,
    metadata: {
      examName: data.examName,
    },
  });
}

export interface ExamSubmissionReceivedMetaData {
  userName: string;
  examName: string;
  submittedAt: string;
  examUrl: string;
}

export async function sendExamSubmissionReceivedNotification(
  userId: string,
  userEmail: string,
  data: ExamSubmissionReceivedMetaData,
): Promise<SendNotificationResponse> {
  return sendEmailNotification({
    userId,
    userEmail,
    type: NotificationType.EXAM_SUBMISSION_RECEIVED,
    title: `Bài kiểm tra "${data.examName}" của bạn đã được gửi`,
    metadata: {
      examName: data.examName,
      submittedAt: data.submittedAt,
      examUrl: data.examUrl,
    },
  });
}

export interface ExamGradingCompletedMetaData {
  userName: string;
  examName: string;
  score: string;
  resultUrl: string;
}

export async function sendExamGradingCompletedNotification(
  userId: string,
  userEmail: string,
  data: ExamGradingCompletedMetaData,
): Promise<SendNotificationResponse> {
  return sendEmailNotification({
    userId,
    userEmail,
    type: NotificationType.EXAM_GRADING_COMPLETED,
    title: `Kết quả bài kiểm tra "${data.examName}" đã được công bố`,
    metadata: {
      examName: data.examName,
      score: data.score,
      resultUrl: data.resultUrl,
    },
  });
}
