import { http } from "@/lib/api/http-status";
import { notificationsRepository } from "@/repository";
import { CreateNotificationPayload } from "@/repository/notifications/type";
export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CreateNotificationPayload[];

    if (!Array.isArray(payload) || payload.length === 0) {
      return http.badRequest("Payload must be a non-empty array");
    }

    if (payload.some((it) => !it.employee_id)) {
      return http.badRequest("Some EmployeeId invalid");
    }

    if (payload.some((it) => !it.organization_id)) {
      return http.badRequest("Some organization_id invalid");
    }

    const data = await notificationsRepository.bulkCreateNotification(payload);

    return http.created(data);
  } catch (error: any) {
    console.error("Create notification error:", error);
    return http.serverError(error.message);
  }
}
