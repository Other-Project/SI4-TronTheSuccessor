const http = require("http");
const {HTTP_STATUS, sendResponse, getUser, getRequestBody} = require("./js/utils.js");
const {getFriendsList} = require("./helper/userHelper.js");
const {Server} = require("socket.io");

let connectedUsers = new Map();
let numberOfConnectedUsers = 0;
let unreadNotifications = {};

const server = http.createServer(async (request, response) => {
    const filePath = request.url.split("/").filter(elem => elem !== ".." && elem !== "");
    const user = getUser(request);
    if (!user) return sendResponse(response, HTTP_STATUS.UNAUTHORIZED);

    if (filePath.length === 3 && filePath[2] === "chat" && request.method === "POST") {
        const body = await getRequestBody(request);
        const friend = JSON.parse(body);
        const friendSocketId = connectedUsers.get(friend.username);
        addUnreadNotification(friend.username, user.username);
        if (friendSocketId) io.to(friendSocketId).emit("unreadNotification", {username: user.username});
    }

    return sendResponse(response, HTTP_STATUS.NOT_FOUND);
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

    const connectedFriends = Array.from(connectedUsers.keys()).filter(username => friends.friends.includes(username));
    socket.emit("initialize", {
        connectedFriends: connectedFriends,
        unreadNotifications: Array.from(unreadNotifications[user.username] || [])
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
        const connectedFriends = Array.from(connectedUsers.keys()).filter(username => friends.friends.includes(username));
        connectedFriends.forEach(friend => {
            const friendSocketId = connectedUsers.get(friend);
            if (friendSocketId) io.to(friendSocketId).emit("disconnected", {username: user.username});
        });
    });

    socket.on("readNotification", async (friend) => {
        removeUnreadNotification(socket.request.headers.authorization, friend);
    });
});

/**
 * Add an unread notification for a user.
 * @param key the user who received the notification
 * @param value the user who sent the notification
 */
function addUnreadNotification(key, value) {
    if (!unreadNotifications[key]) unreadNotifications[key] = new Set();
    unreadNotifications[key].add(value);
}

/**
 * Remove an unread notification for a user.
 * @param key the user who received the notification
 * @param value the user who sent the notification
 */
function removeUnreadNotification(key, value) {
    if (unreadNotifications[key]) unreadNotifications[key].delete(value);
}
