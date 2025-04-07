import {getAccessToken, renewAccessToken} from "./login-manager.js";
import "./socket.io.js";

/**
 * Class to handle notifications
 */
export class NotificationService extends EventTarget {
    connectedFriends = [];
    unreadNotifications = [];
    numberOfConnectedUsers = 0;

    constructor() {
        super();
        if (NotificationService.instance) return NotificationService.instance;
        NotificationService.instance = this;

        window.addEventListener('pageshow', async (event) => {
            if (event.persisted) await this.openWebSocket();
        });
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
            this.connectedFriends = notification.connectedFriends;
            this.unreadNotifications = notification.unreadNotifications;
        });

        this.socket.on("connected", (notification) => {
            this.connectedFriends.push(notification.username);
            this.dispatchEvent(new CustomEvent("friend-status-update", {
                detail: {
                    friend: notification.username,
                    connected: true
                }
            }));
        });

        this.socket.on("disconnected", (notification) => {
            this.connectedFriends.splice(this.connectedFriends.indexOf(notification.username), 1);
            this.dispatchEvent(new CustomEvent("friend-status-update", {
                detail: {
                    friend: notification.username,
                    connected: false
                }
            }));
        });

        this.socket.on("userCount", (notification) => {
            this.numberOfConnectedUsers = notification;
            this.dispatchEvent(new CustomEvent("user-count-update"));
        });

        this.socket.on("unreadNotification", (notification) => {
            this.unreadNotifications.push(notification.username);
            this.dispatchEvent(new CustomEvent("unread-notification", {
                detail: {
                    friend: notification.username
                }
            }));
        });

        this.socket.on("refreshFriendList", () => {
            this.dispatchEvent(new CustomEvent("refresh-friend-list"));
        });
    }

    getUnreadNotifications() {
        return this.unreadNotifications;
    }

    getConnectedFriends() {
        return this.connectedFriends;
    }

    getNumberOfConnectedUsers() {
        return this.numberOfConnectedUsers;
    }

    readNotification(friend) {
        this.unreadNotifications.splice(this.unreadNotifications.indexOf(friend), 1);
        this.socket.emit("readNotification", friend);
    }

    disconnect() {
        if (this.socket) this.socket.disconnect();
        this.socket = null;
        this.dispatchEvent(new CustomEvent("user-count-update"));
    }
}

const notificationService = new NotificationService();
export default notificationService;
