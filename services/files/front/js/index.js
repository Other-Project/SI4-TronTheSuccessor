import notificationService from "./notification.js";

document.addEventListener("logged-in", async () => await notificationService.openWebSocket());
await notificationService.openWebSocket();
