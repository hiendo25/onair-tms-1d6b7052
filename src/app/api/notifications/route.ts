import { http } from "@/lib/api/http-status";
import { DomainError } from "@/lib/errors/DomainError";
import { notificationsRepository } from "@/repository";
import { authRepository } from "@/repository";
import { CreateNotificationPayload } from "@/repository/notifications/type";
export async function POST(request: Request) {
  try {
    const currentUser = authRepository.getCurrentUser();

    if (!currentUser) {
      return http.unauthorized();
    }

    const payload = (await request.json()) as CreateNotificationPayload;

    if (!payload.employee_id) {
      return http.badRequest("Invalid employee_id");
    }

    if (!payload.organization_id) {
      return http.badRequest("Invalid organization_id");
    }

    const data = await notificationsRepository.createNotification(payload);

    return http.created(data);
  } catch (err) {
    if (err instanceof DomainError) {
      return http.fromDomainError(err);
    }
    return http.serverError("Can't create notification");
  }
}
