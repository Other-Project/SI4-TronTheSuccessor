import {getAccessToken, renewAccessToken} from "./login-manager.js";
import "./socket.io.js";

/**
 * Class to handle notifications
 */
export class Notification {

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
            setTimeout(() => {
                document.dispatchEvent(new CustomEvent("initialize-friend-status", {
                    detail: {
                        connectedFriends: notification.connectedFriends,
                    }
                }));
            }, 1000);
        });

        this.socket.on("connected", (notification) => {
            document.dispatchEvent(new CustomEvent("friend-status-update", {
                detail: {
                    friend: notification.username,
                    connected: true
                }
            }));
        });

        this.socket.on("disconnected", (notification) => {
            document.dispatchEvent(new CustomEvent("friend-status-update", {
                detail: {
                    friend: notification.username,
                    connected: false
                }
            }));
        });
    }
}
