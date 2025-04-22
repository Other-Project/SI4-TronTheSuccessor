const http = require("http");
const {Server} = require("socket.io");
const jwt = require("jsonwebtoken");
const chatDatabase = require("./js/chatDatabase.js");
const {HTTP_STATUS, sendResponse, getRequestBody, getUser} = require("./js/utils.js");
const {getFriendsList} = require("./helper/userHelper.js");
const {notifyMessageSent} = require("./helper/notificationHelper.js");
const {getRoomId} = require("./js/chatDatabase.js");


const server = http.createServer(async (request, response) => {
    // noinspection HttpUrlsUsage
    const requestUrl = new URL(request.url, `http://${request.headers.host}`);
    const user = getUser(request);
    if (!user) return sendResponse(response, HTTP_STATUS.UNAUTHORIZED);

    const endpoint = /^\/api\/chat\/([a-zA-Z0-9]+)\/?$/;
    const gameInvitationEndpoint = /^\/api\/chat\/game-invitation\/?$/;
    if (endpoint.test(requestUrl.pathname)) {
        const room = endpoint.exec(requestUrl.pathname)[1];
        const roomId = getRoomId(user.username, room);
        if (request.method === "GET") {
            const before = requestUrl.searchParams.get("before");
            const messages = await chatDatabase.getChat(roomId, before, Math.max(1, Math.min(25, parseInt(requestUrl.searchParams.get("limit")))) || 25);
            return sendResponse(response, HTTP_STATUS.OK, messages);
        } else if (request.method === "POST") {
            const message = JSON.parse(await getRequestBody(request));
            if (!chatDatabase.verifyMessage(message)) return sendResponse(response, HTTP_STATUS.BAD_REQUEST);
            let storedMessage;
            if (message.type === "game-invitation") {
                storedMessage = await chatDatabase.sendGameInvitation(roomId, user.username, message.type, message.content, room);
            } else
                storedMessage = await chatDatabase.storeMessage(roomId, user.username, message.type, message.content);
            if (storedMessage.shouldEmit) io.to(roomId).emit("message", storedMessage);
            await notifyMessageSent(request.headers.authorization, room);
            return sendResponse(response, HTTP_STATUS.CREATED, message.type === "game-invitation" ? {gameInvitationToken: storedMessage.gameInvitationToken} : null);
        }
    } else if ((/^\/api\/chat\/?$/).test(requestUrl.pathname)) {
        if (request.method === "GET") {
            const messages = await chatDatabase.getAllRoom(user.username);
            const allFriends = await getFriendsList(request.headers.authorization);
            const friends = allFriends.friends ?? [];
            const pendingFromUser = allFriends.pending ?? [];
            const pendingForUser = allFriends.pendingForUser ?? [];

            const chatBox = await Promise.all(messages.map(async username => {
                const chatMessages = await chatDatabase.getChat([user.username, username], undefined, 1);
                const lastMessage = chatMessages.length > 0 ? chatMessages[0] : null;

                let pendingStatus;
                if (friends.includes(username)) pendingStatus = undefined;
                else if (pendingFromUser.includes(username)) pendingStatus = user.username;
                else pendingStatus = pendingForUser.includes(username) ? username : undefined;

                return {
                    username: username,
                    friend: friends.includes(username),
                    pending: pendingStatus,
                    last: lastMessage.content
                };
            }));
            return sendResponse(response, HTTP_STATUS.OK, chatBox);
        }
    } else if (gameInvitationEndpoint.test(requestUrl.pathname)) {
        if (request.method === "PUT") {
            const body = JSON.parse(await getRequestBody(request));

            const gameInvitationToken = body.gameInvitationToken;
            if (!gameInvitationToken)
                return sendResponse(response, HTTP_STATUS.BAD_REQUEST, {error: "Game invitation has expired or is invalid"});

            if (!body.status || !["accepted", "refused", "cancelled"].includes(body.status))
                return sendResponse(response, HTTP_STATUS.BAD_REQUEST, {error: "Invalid status"});

            const author = jwt.decode(gameInvitationToken).author;

            if (author === user.username && body.status !== "cancelled")
                return sendResponse(response, HTTP_STATUS.FORBIDDEN, {error: "Cannot respond to your own invitation"});

            if (await chatDatabase.updateGameInvitationStatus(gameInvitationToken, body.status))
                return sendResponse(response, HTTP_STATUS.OK, {status: body.status});
            else
                return sendResponse(response, HTTP_STATUS.BAD_REQUEST, {error: "The game invitation has expired or is invalid, its status cannot be updated"});
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
        if (roomId !== "global") await notifyMessageSent(socket.request.headers.authorization, roomId.filter(elem => elem !== user.username)[0]);
        callback?.(true);
    });
});
