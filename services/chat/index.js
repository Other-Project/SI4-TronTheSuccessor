const http = require("http");
const {Server} = require("socket.io");
const chatDatabase = require("./js/chatDatabase.js");
const {HTTP_STATUS, sendResponse, getRequestBody, getUser} = require("./js/utils.js");
const {getFriendsList} = require("./helper/userHelper.js");
const {getRoomId} = require("./js/chatDatabase.js");


const server = http.createServer(async (request, response) => {
    // noinspection HttpUrlsUsage
    const requestUrl = new URL(request.url, `http://${request.headers.host}`);
    const user = getUser(request);
    if (!user) return sendResponse(response, HTTP_STATUS.UNAUTHORIZED);

    const endpoint = /^\/api\/chat\/([a-zA-Z0-9]+)\/?$/;
    if (endpoint.test(requestUrl.pathname)) {
        const roomId = getRoomId(user.username, endpoint.exec(requestUrl.pathname)[1]);

        if (request.method === "GET") {
            const from = requestUrl.searchParams.get("from");
            const messages = await chatDatabase.getChat(roomId, from);
            return sendResponse(response, HTTP_STATUS.OK, messages);
        } else if (request.method === "POST") {
            const message = JSON.parse(await getRequestBody(request));
            if (!chatDatabase.verifyMessage(message)) return sendResponse(response, HTTP_STATUS.BAD_REQUEST);
            io.to(roomId).emit("message", await chatDatabase.storeMessage(roomId, user.username, message.type, message.content));
            return sendResponse(response, HTTP_STATUS.CREATED);
        }
    } else if ((/^\/api\/chat\/?$/).test(requestUrl.pathname)) {
        if (request.method === "GET") {
            const messages = await chatDatabase.getAllRoom(user.username);
            const friends = await getFriendsList(request.headers.authorization) ?? [];
            const chatBox = await Promise.all(messages.map(async username => {
                const chatMessages = await chatDatabase.getChat([user.username, username], undefined, 1, 1);
                const lastMessage = chatMessages.length > 0 ? chatMessages[0] : null;
                return {
                    username: username,
                    pending: !friends.includes(username) && username !== "global" ? lastMessage?.author : undefined,
                    last: lastMessage.content
                };
            }));
            return sendResponse(response, HTTP_STATUS.OK, chatBox);
        }
    } else {
        return sendResponse(response, HTTP_STATUS.NOT_FOUND);
    }
}).listen(8006);


const io = new Server(server);
io.on("connection", (socket) => {
    const user = getUser(socket.request);
    if (!user) {
        socket.disconnect();
        return;
    }

    let roomId = null;
    socket.on("join", (room) => {
        roomId = getRoomId(user.username, room);
        socket.join(roomId);
    });

    socket.on("message", async (message, callback) => {
        if (!roomId) {
            console.error("No room joined");
            callback?.(false);
            return;
        }

        if (!chatDatabase.verifyMessage(message)) {
            console.error("Invalid message");
            callback?.(false);
            return;
        }

        io.to(roomId).emit("message", await chatDatabase.storeMessage(roomId, user.username, message.type, message.content));
        callback?.(true);
    });
});
