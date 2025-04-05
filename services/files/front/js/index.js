import notificationService from "./notification.js";

document.addEventListener("logged-in", () => notificationService.openWebSocket().then());
notificationService.openWebSocket().then();
