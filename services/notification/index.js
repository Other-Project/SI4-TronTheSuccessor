const http = require("http");
const {HTTP_STATUS, sendResponse, getUser} = require("./js/utils.js");
const {getFriendsList} = require("./helper/userHelper.js");
const {Server} = require("socket.io");

const server = http.createServer(async (request, response) => {
    const filePath = request.url.split("/").filter(elem => elem !== ".." && elem !== "");
    const user = getUser(request);
    if (!user) return sendResponse(response, HTTP_STATUS.UNAUTHORIZED);

    return sendResponse(response, HTTP_STATUS.NOT_FOUND);
}).listen(8005);

let connectedUsers = new Map();
let numberOfConnectedUsers = 0;

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
    socket.emit("initialize", {connectedFriends: connectedFriends});

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
});
