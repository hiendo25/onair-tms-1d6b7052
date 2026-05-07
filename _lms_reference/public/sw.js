self.addEventListener("push", (event) => {
  console.log("🔥 PUSH RECEIVED");

  try {
    const data = event.data.json();
    console.log({ data });
    event.waitUntil(
      self.registration.showNotification(data.title || "Onair thông báo", {
        body: data.body || "",
        icon: "/assets/icons/brand/icon-192x192.png",
        badge: "/assets/icons/brand/icon-192x192.png",
        data: {
          url: data.url || "/",
          dateOfArrival: Date.now(),
        },
        requireInteraction: true,
      }),
    );
  } catch (err) {
    console.log(err);
  }
});

self.addEventListener("notificationclick", function (event) {
  console.log("Notification click received.");
  event.notification.close();
  event.waitUntil(self.clients.openWindow(event.notification.data?.url || "/"));
});
