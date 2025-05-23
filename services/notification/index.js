const http = require("http");
const {HTTP_STATUS, sendResponse, getUser, getRequestBody} = require("./js/utils.js");
const {getFriendsList} = require("./helper/userHelper.js");
const {Server} = require("socket.io");
const notificationDatabase = require("./js/notification-database.js");
const admin = require("firebase-admin");
const serviceAccount = require("./tronthesuccessor-firebase-adminsdk-fbsvc-f8e620f65d.json");

let connectedUsers = new Map();
let numberOfConnectedUsers = 0;
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const server = http.createServer(async (request, response) => {
    const filePath = request.url.split("/").filter(elem => elem !== ".." && elem !== "");
    const user = getUser(request);
    if (!user) return sendResponse(response, HTTP_STATUS.UNAUTHORIZED);

    if (filePath.length === 3 && filePath[2] === "chat" && request.method === "POST") {
        await handleUnreadNotification(request, user.username);
        return sendResponse(response, HTTP_STATUS.OK);
    } else if (filePath.length === 3 && filePath[2] === "friend" && request.method === "POST") await handleFriendListModification(request, response, user.username, true);
    else if (filePath.length === 3 && filePath[2] === "friend" && request.method === "DELETE") await handleFriendListModification(request, response, user.username, false);
    else if (filePath.length === 3 && filePath[2] === "register" && request.method === "POST") await handleRegisterNotificationToken(request, response, user.username);
    else return sendResponse(response, HTTP_STATUS.NOT_FOUND);
}).listen(8005);

const io = new Server(server);
io.on("connection", async (socket) => {
    const user = getUser(socket.request);
    if (!user) {
        socket.disconnect();
        return;
    }
    connectedUsers.set(user.username, socket.id);
    numberOfConnectedUsers++;

    io.emit("userCount", numberOfConnectedUsers);

    const friends = await getFriendsList(socket.request.headers.authorization);
    const connectedFriends = Array.from(connectedUsers.keys()).filter(username => friends?.friends?.includes(username));

    socket.emit("initialize", {
        connectedFriends: connectedFriends,
        unreadNotifications: await notificationDatabase.getUniqueNotificationSenders(user.username)
    });

    connectedFriends.forEach(friend => {
        const friendSocketId = connectedUsers.get(friend);
        if (friendSocketId) io.to(friendSocketId).emit("connected", {username: user.username});
    });

    socket.on("disconnect", async () => {
        numberOfConnectedUsers--;

        io.emit("userCount", numberOfConnectedUsers);

        connectedUsers.delete(user.username);
        const friends = await getFriendsList(socket.request.headers.authorization);
        const connectedFriends = Array.from(connectedUsers.keys()).filter(username => friends?.friends?.includes(username));
        connectedFriends.forEach(friend => {
            const friendSocketId = connectedUsers.get(friend);
            if (friendSocketId) io.to(friendSocketId).emit("disconnected", {username: user.username});
        });
    });

    socket.on("readNotification", async (friend) => {
        await notificationDatabase.removeNotification(user.username, friend);
    });
});

/**
 * Handle the friend list modification event.
 * @param {module:http.IncomingMessage} request the request object
 * @param {module:http.ServerResponse} response the response object
 * @param {string} username the username of the user who sent the message
 * @param {boolean} add whether the friend is being added or removed
 */
async function handleFriendListModification(request, response, username, add) {
    const data = await handleUnreadNotification(request, username);
    const friendSocketId = connectedUsers.get(data.username);
    const userSocketId = connectedUsers.get(username);

    if (userSocketId) {
        io.to(userSocketId).emit("refreshFriendList");
        if (connectedUsers.has(data.username) && !data.pending) io.to(userSocketId).emit(add ? "connected" : "disconnected", {username: data.username});
    }

    if (data.pending && !friendSocketId) {
        const token = await notificationDatabase.getNotificationTokens(data.username);
        if (token) {
            await sendPushNotification(
                token,
                `${username} sent you a friend request`,
                "Do you wish to accept it?",
                {
                    channelId: "important-notifications",
                    actionTypeId: "response-action",
                    extra: {
                        friend: username,
                        redirect: `/#chat`
                    }
                }
            );
        }
    }

    if (!friendSocketId) return sendResponse(response, HTTP_STATUS.OK);

    io.to(friendSocketId).emit("refreshFriendList", {username: username, pending: data.pending});
    if (connectedUsers.has(username) && !data.pending) io.to(friendSocketId).emit(add ? "connected" : "disconnected", {username: username});
    sendResponse(response, HTTP_STATUS.OK);
}

/**
 * Handle the unread notification event.
 * @param {module:http.IncomingMessage} request the request object
 * @param {string} username the username of the user who sent the message
 * @returns {Promise<{username: string, pending: boolean}>} the parsed body
 */
async function handleUnreadNotification(request, username) {
    const body = await getRequestBody(request);
    const data = JSON.parse(body);
    const friendSocketId = connectedUsers.get(data.username);
    await notificationDatabase.addNotification(data.username, username);
    if (friendSocketId) io.to(friendSocketId).emit("unreadNotification", {
        username: username,
        preview: data.preview ?? "Hey, let's be friends!"
    });
    else {
        const token = await notificationDatabase.getNotificationTokens(data.username);
        if (token && data.preview) {
            await sendPushNotification(
                token,
                `${username} sent you a message`,
                data.preview,
                {
                    channelId: "default-notifications",
                    extra: {
                        friend: username,
                        redirect: `/#chat`
                    }
                }
            );
        }
    }
    return data;
}

/**
 * Handle the register notification token event.
 * @param {module:http.IncomingMessage} request the request object
 * @param {module:http.ServerResponse} response the response object
 * @param {string} username the username of the user who sent the message
 */
async function handleRegisterNotificationToken(request, response, username) {
    const body = await getRequestBody(request);
    const data = JSON.parse(body);
    await notificationDatabase.registerNotificationToken(username, data.token, data.device);
    return sendResponse(response, HTTP_STATUS.OK, {message: "Notification token registered"});
}

/**
 * Send a push notification to a user.
 * @param {string[]} userTokens All notification tokens of the user.
 * @param {string} title The notification title.
 * @param {string} body The notification body.
 * @param options
 */
async function sendPushNotification(userTokens, title, body, options = {}) {
    try {
        const message = {
            token: userTokens,
            notification: {
                title: title,
                body: body
            },
            data: {
                ...(options.extra || {}),
                channelId: options.channelId || "default-notifications",
                actionTypeId: options.actionTypeId || ""
            },
            android: {
                notification: {
                    channelId: options.channelId || "default-notifications",
                    clickAction: options.actionTypeId || ""
                }
            },
            // iOS specific settings
            apns: {
                payload: {
                    aps: {
                        category: options.actionTypeId || "",
                        contentAvailable: true
                    }
                },
                fcmOptions: {}
            }
        };

        const response = await admin.messaging().send(message);
        console.log("Successfully sent message: ", response);
        return response;
    } catch (error) {
        console.error("Error sending message: ", error);
        throw error;
    }
}
