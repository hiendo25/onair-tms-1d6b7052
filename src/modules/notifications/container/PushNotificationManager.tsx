"use client";

import { useEffect, useState } from "react";
import { useTransition } from "react";
import { Button, Typography } from "@mui/material";

import {
  useSendNotificationsMutation,
  useSubscribeNotificationMutation,
  useUnSubscribeNotificationMutation,
} from "../operations/mutation";
export default function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  const { mutate: sendNotification, isPending: isPendingSend } = useSendNotificationsMutation();
  const { mutate: subscribeUser, isPending: isPendingSubscribeUser } = useSubscribeNotificationMutation();

  const { mutate: unSubscribeUser, isPending: isPendingUnSub } = useUnSubscribeNotificationMutation();

  console.log({ subscription });

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
  }

  const subscribeToPush = async () => {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      alert("bạn chưa cho phép nhận thông báo trên trình duyệt");
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
    });

    console.log({ registration, sub });
    const serializedSub = JSON.parse(JSON.stringify(sub)) as {
      endpoint: string;
      expirationTime: null | string;
      keys: {
        auth: string;
        p256dh: string;
      };
    };
    subscribeUser(
      { auth: serializedSub.keys.auth, p256dh: serializedSub.keys.p256dh, endpoint: serializedSub.endpoint },
      {
        onSuccess(data) {
          setSubscription(sub);
        },
      },
    );
  };

  const unsubscribeFromPush = () => {
    if (!subscription) return;

    unSubscribeUser(subscription.endpoint, {
      onSuccess(data, variables, onMutateResult, context) {
        setSubscription(null);
        subscription.unsubscribe();
      },
    });
  };

  async function sendTestNotification() {
    sendNotification("message");
  }

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  if (!isSupported) {
    return (
      <Typography className="text-sm">Chức năng thông báo hiện đang không hỗ trợ trên trình duyệt này.</Typography>
    );
  }

  return (
    <div className="w-full">
      <div className="header mb-1">
        <Typography sx={{ fontWeight: 600 }}>Thông báo</Typography>
      </div>
      {subscription ? (
        <div>
          <div>
            <Typography sx={{ fontSize: 14 }} gutterBottom>
              Bạn đã bật tính năng thông báo trên trình duyệt.
            </Typography>
            <div className="flex gap-2">
              <Button onClick={sendTestNotification} size="small" className="h-auto text-xs flex-1">
                Gửi test
              </Button>
              <Button
                onClick={unsubscribeFromPush}
                variant="fill"
                color="error"
                size="small"
                loading={isPendingUnSub}
                className="h-auto text-xs flex-1"
              >
                Hủy đăng ký
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <Typography sx={{ fontSize: 14 }} gutterBottom>
            Đăng ký nhận thông báo
          </Typography>
          <Button
            onClick={subscribeToPush}
            variant="contained"
            color="primary"
            loading={isPendingSubscribeUser}
            size="small"
            className="h-auto text-xs flex-1"
          >
            Đăng ký
          </Button>
        </div>
      )}
    </div>
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
