import webpush from "web-push";
webpush.setVapidDetails(
  process.env.VAPID_CONTACT || "mailto:devops@onairtms.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
    "BMJ7XH6nrOG0EkwlSQpbziDuVu5Uxg1yClioGEa3wyPxfMe_q9l6avidF0tkTxaS9_HWJxi2wXo-XvSaqD0NnrE",
  process.env.VAPID_PRIVATE_KEY || "YpMCDd0LHpVhlA2NbRI_XvJjgjmdE0JJh-qGStbIeRE",
);

export { webpush };
