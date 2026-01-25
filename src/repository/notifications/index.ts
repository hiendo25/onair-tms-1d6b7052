import { NotificationType } from "@/model/notification.model";
import { createClient } from "@/services";
import { createServiceRoleClient } from "@/services";

import { CreateNotificationPayload, MarkNotificationAsReadPayload } from "./type";

type BaseNotificationQueryParams = {
  organizationId?: string;
  page?: number;
  pageSize?: number;
  type?: NotificationType;
};
const createNotification = async (payload: CreateNotificationPayload) => {
  try {
    const adminSupabase = await createServiceRoleClient();
    const { data, error } = await adminSupabase.from("notifications").insert(payload).select("*").single();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  } catch (err: any) {
    throw new Error(`Failed to create notification: ${err?.message}`);
  }
};
export type CreateNotificationResponse = Awaited<ReturnType<typeof createNotification>>;

const bulkCreateNotification = async (payload: CreateNotificationPayload[]) => {
  try {
    const adminSupabase = await createServiceRoleClient();
    const { data, error } = await adminSupabase.from("notifications").insert(payload).select("*");

    if (error) {
      throw new Error(error?.message);
    }
    return data;
  } catch (err: any) {
    throw new Error(`Failed to create notification: ${err?.message}`);
  }
};
export type BulkCreateNotification = Awaited<ReturnType<typeof bulkCreateNotification>>;

export type GetNotificationQueryParams = BaseNotificationQueryParams;

const getNotifications = async (queryParams?: GetNotificationQueryParams) => {
  const { page = 1, pageSize = 20, organizationId, type } = queryParams || {};
  const from = page > 0 ? (page - 1) * pageSize : page;
  const to = from + pageSize - 1;

  try {
    const supabase = createClient();
    let query = supabase.from("notifications").select("*", { count: "exact" });

    if (organizationId) {
      query = query.eq("organization_id", organizationId);
    }

    if (type) {
      query = query.eq("type", type);
    }
    const { data, error } = await query.range(from, to).order("created_at", { ascending: false });

    if (error) {
      throw new Error(error?.message);
    }

    return data;
  } catch (err: any) {
    throw new Error(`Failed to create notification: ${err?.message}`);
  }
};
export type GetNotificationsResponse = Awaited<ReturnType<typeof getNotifications>>;

export type GetNotificationsByEmployeeQueryParams = BaseNotificationQueryParams & {
  employeeId: string;
  type?: NotificationType;
};
const getNotificationsByEmployee = async (queryParams: GetNotificationsByEmployeeQueryParams) => {
  const { page = 1, pageSize = 20, organizationId, employeeId, type } = queryParams || {};
  const from = page > 0 ? (page - 1) * pageSize : page;
  const to = from + pageSize - 1;

  try {
    const supabase = createClient();
    let query = supabase.from("notifications").select("*", { count: "exact" });

    if (organizationId) {
      query = query.eq("organization_id", organizationId);
    }

    query = query.eq("employee_id", employeeId);

    if (type) {
      query = query.eq("type", type);
    }
    return await query.range(from, to).order("created_at", { ascending: false });
  } catch (err: any) {
    throw new Error(`Failed to create notification: ${err?.message}`);
  }
};
export type GetNotificationByEmployeeResponse = Awaited<ReturnType<typeof getNotificationsByEmployee>>;

const getNotificationsCount = async ({ employeeId, onlyUnRead }: { employeeId: string; onlyUnRead: boolean }) => {
  try {
    const supabase = createClient();
    return await supabase.rpc("get_notification_count_by_type", { employee_id: employeeId, unread_only: onlyUnRead });
  } catch (err: any) {
    throw new Error(`Failed to create notification: ${err?.message}`);
  }
};

const markNotificationAsRead = async (payload: MarkNotificationAsReadPayload) => {
  try {
    const supabase = createClient();
    return await supabase.from("notifications").update({ is_read: true }).eq("id", payload.id).select("*").single();
  } catch (err: any) {
    throw new Error(`Failed to markNotificationAsRead: ${err?.message}`);
  }
};
export type MarkNotificationAsReadResponse = Awaited<ReturnType<typeof markNotificationAsRead>>;

export {
  getNotifications,
  getNotificationsByEmployee,
  createNotification,
  bulkCreateNotification,
  getNotificationsCount,
  markNotificationAsRead,
};
