import notificationService from "./notification.js";
import "./polyfill.js"

document.addEventListener("logged-in", async () => await notificationService.openWebSocket());
await notificationService.openWebSocket();
await notificationService.initializeNotifications();
