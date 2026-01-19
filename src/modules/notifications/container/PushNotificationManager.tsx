"use client";

import { useEffect, useState } from "react";
import { useTransition } from "react";
import { Button, Typography } from "@mui/material";
import dayjs from "dayjs";
import Image from "next/image";
import { createPortal } from "react-dom";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useUserOrganization } from "@/modules/organization";
import {
  useSendNotificationsMutation,
  useSubscribeNotificationMutation,
  useUnSubscribeNotificationMutation,
} from "../operations/mutation";

const VAPID_PUBLISH_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  "BMJ7XH6nrOG0EkwlSQpbziDuVu5Uxg1yClioGEa3wyPxfMe_q9l6avidF0tkTxaS9_HWJxi2wXo-XvSaqD0NnrE";
export default function PushNotificationManager() {
  const currentOrg = useUserOrganization((state) => state.currentOrganization);
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isTransition, startTransition] = useTransition();
  const [showPopupNotify, setShowPopupNotify] = useState(false);
  const { mutate: sendNotification, isPending: isPendingSend } = useSendNotificationsMutation();
  const { mutate: subscribeUser, isPending: isPendingSubscribeUser } = useSubscribeNotificationMutation();

  const { mutate: unSubscribeUser, isPending: isPendingUnSub } = useUnSubscribeNotificationMutation();

  const { value: notificationStorage, set } = useLocalStorage("PUSH_NOTIFICATION_RECEIVED");
  const subscribeToPush = () => {
    startTransition(async () => {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("Bạn chưa cho phép nhận thông báo trên trình duyệt");
        return;
      }

      const registration = await navigator.serviceWorker.ready;

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLISH_KEY),
      });

      const serializedSub = sub.toJSON() as ReturnType<typeof sub.toJSON> & {
        keys?: {
          auth?: string;
          p256dh?: string;
        };
      };

      if (!serializedSub || !serializedSub?.keys?.auth || !serializedSub?.keys?.p256dh || !serializedSub.endpoint)
        return;

      subscribeUser(
        { auth: serializedSub.keys.auth, p256dh: serializedSub.keys.p256dh, endpoint: serializedSub.endpoint },
        {
          onSuccess(data) {
            setSubscription(sub);
            set({ except: true, timeStamp: dayjs().valueOf() });
          },
        },
      );
    });
  };

  const unsubscribeFromPush = () => {
    if (!subscription) return;
    unSubscribeUser(subscription.endpoint, {
      onSuccess(data, variables, onMutateResult, context) {
        setSubscription(null);
        subscription.unsubscribe();
        set({ except: false, timeStamp: dayjs().valueOf() });
      },
    });
  };

  const cancelReceived = () => {
    set({ except: false, timeStamp: dayjs().valueOf() });
  };

  useEffect(() => {
    if (!isSupported || subscription || notificationStorage) return;

    const timeId = setTimeout(() => {
      setShowPopupNotify(true);
      clearTimeout(timeId);
    }, 1000);

    return () => {
      clearTimeout(timeId);
    };
  }, [isSupported, subscription, notificationStorage]);

  useEffect(() => {
    const registerServiceWorker = async () => {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
    };

    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  if (!showPopupNotify) {
    return null;
  }

  return createPortal(
    <div className="notifications fixed top-2 left-8 z-9999">
      <div className="inner bg-white shadow-sm border-gray-200 border rounded-2xl p-3 w-full max-w-80">
        <div className="flex items-center gap-3 mb-3">
          <div className="notification-thumbnail w-18">
            <Image src={currentOrg.orgLogo} alt={currentOrg.orgShortName} width={100} height={100} />
          </div>
          <div className="notification-content flex-1">
            <Typography sx={{ fontWeight: 600 }} gutterBottom>
              Đồng ý nhận thông báo?
            </Typography>
            <Typography sx={{ fontSize: 13 }} gutterBottom>
              Nhận thông báo về lịch học, lớp học, lịch giảng dạy và các thông báo quan trọng khác.
            </Typography>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={cancelReceived}
            variant="fill"
            color="primary"
            size="small"
            className="h-auto text-xs flex-1 rounded-full"
          >
            Để sau
          </Button>
          {subscription ? (
            <Button
              onClick={unsubscribeFromPush}
              variant="fill"
              color="error"
              size="small"
              loading={isPendingUnSub}
              className="h-auto text-xs flex-1 rounded-full"
            >
              Hủy đăng ký
            </Button>
          ) : (
            <Button
              onClick={subscribeToPush}
              variant="contained"
              color="primary"
              loading={isPendingSubscribeUser || isTransition}
              size="small"
              className="h-auto text-xs flex-1 rounded-full"
            >
              Đồng ý
            </Button>
          )}
          {/* <Button onClick={sendTestNotification} size="small" className="h-auto text-xs flex-1">
              Gửi test
            </Button> */}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
