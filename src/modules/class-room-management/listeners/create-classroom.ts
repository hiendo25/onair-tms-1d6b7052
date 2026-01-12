import { eventBus } from "@/infrastructure/events";

eventBus.on("classroom.created", (payload) => {
  console.log("listen event then do classroom.created", payload);
});
