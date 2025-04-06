import {getAccessToken, renewAccessToken} from "./login-manager.js";
import "./socket.io.js";

/**
 * Class to handle notifications
 */
export class NotificationService extends EventTarget {
    connectedFriends = [];
    unreadNotifications = [];

    constructor() {
        super();
        if (NotificationService.instance) return NotificationService.instance;
        NotificationService.instance = this;
    }

    async openWebSocket(retry = true) {
        if (this.socket) this.socket.disconnect();
        const token = await getAccessToken();
        if (!token) return;

        this.socket = io("/api/notification", {
            extraHeaders: {authorization: "Bearer " + token},
            path: "/ws"
        });

        this.socket.on("connect_error", async (err) => {
            if (retry && err.message === "Authentication needed") {
                await renewAccessToken();
                this.openWebSocket(false).then();
            } else console.error(err.message);
        });

        this.socket.on("initialize", (notification) => {
            console.log("initialize", notification);
            this.connectedFriends = notification.connectedFriends;
            this.unreadNotifications = notification.unreadNotifications;
        });

        this.socket.on("connected", (notification) => {
            this.dispatchEvent(new CustomEvent("friend-status-update", {
                detail: {
                    friend: notification.username,
                    connected: true
                }
            }));
        });

        this.socket.on("disconnected", (notification) => {
            this.dispatchEvent(new CustomEvent("friend-status-update", {
                detail: {
                    friend: notification.username,
                    connected: false
                }
            }));
        });

        this.socket.on("userCount", (notification) => {
            setTimeout(() => {
                this.dispatchEvent(new CustomEvent("user-count-update", {
                    detail: {
                        nb: notification
                    }
                }));
            }, 1000);
        });

        this.socket.on("unreadNotification", (notification) => {
            this.dispatchEvent(new CustomEvent("unread-notification", {
                detail: {
                    friend: notification.username
                }
            }));
        });
    }

    getUnreadNotifications() {
        return this.unreadNotifications;
    }

    getConnectedFriends() {
        return this.connectedFriends;
    }

    readNotification(friend) {
        this.unreadNotifications.splice(this.unreadNotifications.indexOf(friend), 1);
        this.socket.emit("readNotification", friend);
    }
}

const notificationService = new NotificationService();
export default notificationService;
