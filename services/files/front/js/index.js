import {Notification} from "./notification.js";

const notification = new Notification();
document.addEventListener("logged-in", () => notification.openWebSocket().then());
notification.openWebSocket().then();
