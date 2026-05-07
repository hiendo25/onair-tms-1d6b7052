import { http } from "@/lib/api/http-status";
import { requireAuth } from "@/lib/auth/require-auth";
import { DomainError } from "@/lib/errors/DomainError";
import { MarkAllReadNotificationService } from "@/services/notifications/mark-all-read.service";
export async function POST(request: Request) {
  try {
    const { organizationId, userId, employeeId } = await requireAuth();

    const data = await new MarkAllReadNotificationService(organizationId, employeeId).execute();

    return http.ok(data);
  } catch (err) {
    if (err instanceof DomainError) {
      return http.fromDomainError(err);
    }
    return http.serverError("Mark all read failure");
  }
}
