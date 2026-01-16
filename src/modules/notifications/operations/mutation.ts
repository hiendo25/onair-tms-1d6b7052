import { useQueryClient } from "@tanstack/react-query";

import { useTMutation } from "@/lib";
import { notificationsRepository } from "@/repository";
import { MarkNotificationAsReadPayload } from "@/repository/notifications/type";
import { client } from "@/services/api";
export const useMarkReadNotificationMutation = () => {
  return useTMutation({
    mutationFn: (payload: MarkNotificationAsReadPayload) => notificationsRepository.markNotificationAsRead(payload),
  });
};

export const useSendNotificationsMutation = () => {
  return useTMutation({
    mutationFn: (payload: any) =>
      client.post("/push-subscriptions/send", {
        title: "New Notification",
        body: "Click to view",
        url: "/dashboard",
      }),
  });
};

export const useSubscribeNotificationMutation = () => {
  const queryClient = useQueryClient();
  return useTMutation({
    mutationFn: (payload: { endpoint: string; p256dh: string; auth: string; userAgent?: string }) =>
      client.post("/push-subscriptions/subscribe", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["GET_SUBSCRIBE_USER"] });
    },
  });
};

export const useUnSubscribeNotificationMutation = () => {
  const queryClient = useQueryClient();
  return useTMutation({
    mutationFn: (endpoint: string) => client.post("/push-subscriptions/un-subscribe", { endpoint }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["GET_SUBSCRIBE_USER"] });
    },
  });
};
