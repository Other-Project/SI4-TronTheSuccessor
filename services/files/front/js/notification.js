import {fetchApi, getAccessToken, getUserInfo, renewAccessToken} from "./login-manager.js";
import {changePage} from "/components/pages/pages.js";
import "./socket.io.js";
import "/js/capacitor.min.js";

const {LocalNotifications, PushNotifications, Device} = Capacitor.Plugins;

/**
 * Class to handle notifications
 */
export class NotificationService extends EventTarget {
    connectedFriends = [];
    unreadNotifications = [];
    numberOfConnectedUsers = 0;
    notificationSetUp = false;
    id = 0;

    constructor() {
        super();
        if (NotificationService.instance) return NotificationService.instance;
        NotificationService.instance = this;

        window.addEventListener('pageshow', async (event) => {
            if (event.persisted) {
                await this.openWebSocket();
                await this.initializeNotifications();
            }
        });
    }

    async openWebSocket(retry = true) {
        if (this.socket) this.socket.disconnect();
        const token = await getAccessToken();
        if (!token) return;

        const namespace = "/api/notification";
        this.socket = io(Capacitor.isNativePlatform() ? new URL(namespace, "https://tronsuccessor.ps8.pns.academy").toString() : namespace, {
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

        this.socket.on("unreadNotification", async (notification) => {
            this.unreadNotifications.push(notification.username);
            this.dispatchEvent(new CustomEvent("unread-notification", {
                detail: {
                    friend: notification.username
                }
            }));
            if (Capacitor.isNativePlatform()) {
                await LocalNotifications.schedule({
                    notifications: [
                        {
                            title: `${notification.username} sent you a message`,
                            body: "I would love to display the message but, the Giga Chad backend only send the username 🗿",
                            id: this.id++,
                            channelId: "default-notifications",
                            extra: {
                                friend: notification.username,
                                redirect: `/#${notification.username}`
                            }
                        }
                    ]
                });
            }
        });

        this.socket.on("refreshFriendList", async (friend) => {
            this.dispatchEvent(new CustomEvent("refresh-friend-list"));
            if (!friend || !friend.pending) return;
            await LocalNotifications.schedule({
                notifications: [
                    {
                        title: `${friend.username} as sent you a friend request`,
                        body: "Do you wish to accept it?",
                        id: this.id++,
                        channelId: "important-notifications",
                        actionTypeId: "response-action",
                        extra: {
                            friend: friend.username,
                            redirect: `/#${friend.username}`
                        }
                    }
                ]
            });
        });
    }

    /**
     * Initialize notifications for the app
     * @returns {Promise<void>}
     */
    async initializeNotifications() {
        if (!Capacitor.isNativePlatform() || this.notificationSetUp) return;
        const permStatus = await this.requestPermission();

        if (permStatus) {
            this.notificationSetUp = true;
            await this.createNotificationChannel();
            await this.setupNotificationActions();

            this.setupLocalNotificationListeners();
            this.setupPushListeners();
            PushNotifications.register();
        }
    }

    /**
     * Setup listeners for push notifications
     * @returns {void}
     */
    setupPushListeners() {
        PushNotifications.addListener("registration", async (token) => {
            await fetchApi("/api/notification/register", {
                method: "POST",
                body: JSON.stringify({
                    token: token.value,
                    device: Device.getId().identifier,
                    username: getUserInfo().username
                }),
            });
        });

        PushNotifications.addListener("pushNotificationActionPerformed", async (notification) => {
            const actionId = notification.actionId;
            if (notification.notification.extra.redirect) changePage(notification.notification.extra.redirect);
            if (!actionId) return;
            const friend = notification.notification.extra.friend;

            await fetchApi(`/api/user/friends/${friend}`, {
                method: actionId === "accept" ? "POST" : "DELETE"
            });
        });
    }

    /**
     * Request permission to display notifications
     * @returns {Promise<boolean>}
     */
    async requestPermission() {
        const permResultLocal = await LocalNotifications.requestPermissions();
        const permResultPush = await PushNotifications.requestPermissions();
        return permResultLocal.display === "granted" && permResultPush.receive === "granted";
    }

    /**
     * Create a notification channel for Android
     * @returns {Promise<void>}
     */
    async createNotificationChannel() {
        await LocalNotifications.createChannel({
            id: "important-notifications",
            name: "Important Notifications",
            description: "Notifications that require immediate attention",
            importance: 5,
            visibility: 1,
            vibration: true,
        });
        await LocalNotifications.createChannel({
            id: "default-notifications",
            name: "Default Notifications",
            description: "Notifications",
            importance: 2,
            visibility: 1,
        });
    }

    /**
     * Setup action types for notifications
     * @returns {Promise<void>}
     */
    async setupNotificationActions() {
        await LocalNotifications.registerActionTypes({
            types: [
                {
                    id: "response-action",
                    actions: [
                        {
                            id: "accept",
                            title: "Accept",
                            destructive: false
                        },
                        {
                            id: "decline",
                            title: "Decline",
                            destructive: true
                        }
                    ]
                }
            ]
        });
        await PushNotifications.registerActionTypes({
            types: [
                {
                    id: "response-action",
                    actions: [
                        {
                            id: "accept",
                            title: "Accept",
                            destructive: false
                        },
                        {
                            id: "decline",
                            title: "Decline",
                            destructive: true
                        }
                    ]
                }
            ]
        });
    }

    /**
     * Setup local notification action listeners
     * @returns {void}
     */
    setupLocalNotificationListeners() {
        LocalNotifications.addListener("localNotificationActionPerformed", async (notification) => {
            const actionId = notification.actionId;
            if (notification.notification.extra.redirect) changePage(notification.notification.extra.redirect);
            if (!actionId) return;
            const friend = notification.notification.extra.friend;

            await fetchApi(`/api/user/friends/${friend}`, {
                method: actionId === "accept" ? "POST" : "DELETE",
            });
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
