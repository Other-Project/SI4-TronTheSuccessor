const http = require("http");
const {HTTP_STATUS, sendResponse, getUser, getRequestBody} = require("./js/utils.js");
const {getFriendsList} = require("./helper/userHelper.js");
const {Server} = require("socket.io");
const notificationDatabase = require("./js/notification-database.js");

let connectedUsers = new Map();
let numberOfConnectedUsers = 0;

const server = http.createServer(async (request, response) => {
    const filePath = request.url.split("/").filter(elem => elem !== ".." && elem !== "");
    const user = getUser(request);
    if (!user) return sendResponse(response, HTTP_STATUS.UNAUTHORIZED);

    if (filePath.length === 3 && filePath[2] === "chat" && request.method === "POST") await handleUnreadNotification(request, user);

    else if (filePath.length === 3 && filePath[2] === "friend" && request.method === "POST") {
        const username = await handleUnreadNotification(request, user);
        const userSocketId = connectedUsers.get(username);
        if (userSocketId) io.to(userSocketId).emit("refreshFriendList");
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
 * Handle the unread notification event.
 * @param request the request object
 * @param user the user who sent the message
 * @returns {Promise<string>} the username of the user that need to be notified
 */
async function handleUnreadNotification(request, user) {
    const body = await getRequestBody(request);
    const friend = JSON.parse(body);
    const friendSocketId = connectedUsers.get(friend.username);
    await notificationDatabase.addNotification(friend.username, user.username);
    if (friendSocketId) io.to(friendSocketId).emit("unreadNotification", {username: user.username});
    return friend.username;
}
