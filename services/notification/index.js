const http = require("http");
const {HTTP_STATUS, sendResponse, getRequestBody, getUser} = require("./js/utils.js");
const {Server} = require("socket.io");

const server = http.createServer(async (request, response) => {
    const filePath = request.url.split("/").filter(elem => elem !== ".." && elem !== "");
    const user = getUser(request);
    if (!user) return sendResponse(response, HTTP_STATUS.UNAUTHORIZED);


    return sendResponse(response, HTTP_STATUS.NOT_FOUND);

}).listen(8005);

let connectedUsers = new Set();

const io = new Server(server);
io.on("connection", (socket) => {
    const user = getUser(socket.request);
    if (!user) {
        socket.disconnect();
        return;
    }
    connectedUsers.add(user.username);
    io.emit("connected", {connectedUsers: Array.from(connectedUsers)});

    socket.on("disconnect", () => {
        connectedUsers.delete(user.username);
        io.emit("disconnected", {connectedUsers: Array.from(connectedUsers)});
    });
});
