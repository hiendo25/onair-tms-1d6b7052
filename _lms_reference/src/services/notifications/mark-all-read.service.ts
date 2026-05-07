import { notificationsRepository } from "@/repository";
export class MarkAllReadNotificationService {
  private organizationId: string;
  private employeeId: string;

  constructor(organizationId: string, employeeId: string) {
    this.organizationId = organizationId;
    this.employeeId = employeeId;
  }

  async execute() {
    return await notificationsRepository.markAllReadNotifications(this.employeeId);
  }
}
