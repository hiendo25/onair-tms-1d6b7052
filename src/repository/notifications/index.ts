import axios from "axios";

import type {
  SendBulkNotificationsResponse,
  SendNotificationRequest,
  SendNotificationResponse,
} from "./type";


const NOTIFICATION_API_URL =
  process.env.NEXT_PUBLIC_NOTIFICATION_API_URL ||
  "http://localhost:8003/api/v1/lms-notifications";


const notificationAxios = axios.create({
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});


notificationAxios.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("Notification API error:", error);
    
    if (error.response) {
      console.error("Error response:", {
        status: error.response.status,
        data: error.response.data,
      });
    }
    
    return Promise.reject(error);
  }
);


export async function sendNotification(
  request: SendNotificationRequest
): Promise<SendNotificationResponse> {
  try {
    const response = await notificationAxios.post<SendNotificationResponse>(
      NOTIFICATION_API_URL,
      request
    );
    
    return response as any as SendNotificationResponse;
  } catch (error: any) {
    console.error("Failed to send notification:", error.message);
    
    return {
      success: false,
      message: error.message || "Failed to send notification",
    };
  }
}


export async function sendBulkNotifications(
  requests: SendNotificationRequest[]
): Promise<SendBulkNotificationsResponse> {
  try {
    const results = await Promise.allSettled(
      requests.map((request) => sendNotification(request))
    );
    
    let totalSent = 0;
    let totalFailed = 0;
    const errors: Array<{ userId: string; error: string }> = [];
    
    results.forEach((result, index) => {
      if (result.status === "fulfilled" && result.value.success) {
        totalSent++;
      } else {
        totalFailed++;
        const userId = requests[index]?.userId || "unknown";
        const error =
          result.status === "rejected"
            ? result.reason.message
            : result.value.message || "Unknown error";
        errors.push({ userId, error });
      }
    });
    
    return {
      success: totalFailed === 0,
      totalSent,
      totalFailed,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error: any) {
    console.error("Failed to send bulk notifications:", error.message);
    
    return {
      success: false,
      totalSent: 0,
      totalFailed: requests.length,
      errors: requests.map((req) => ({
        userId: req.userId,
        error: error.message || "Failed to send notification",
      })),
    };
  }
}


