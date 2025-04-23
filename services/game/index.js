const http = require("http");
const {Server} = require("socket.io");
const {Game} = require("./js/game.js");
const {FlowBird} = require("./js/flowbird.js");
const {Player} = require("./js/player.js");
const {randomUUID} = require("crypto");
const jwt = require("jsonwebtoken");
const {updateStats, handleGetAllStats} = require("./js/elo.js");
const {updateHistory, handleGetHistory} = require("./js/history.js");
const {HTTP_STATUS, getUser, sendResponse, getRequestBody} = require("./js/utils.js");
const {verifyFriendship} = require("./helper/userHelper.js");
const {getCollection, getUserInventorySelection} = require("./helper/inventoryHelper.js");

const emotes = ["animethink", "hmph", "huh", "ohgeez", "yawn"];

const FRIEND_GAME_TIMEOUT = 10 * 60 * 1000;
const waitingRoomTimers = {};

let server = http.createServer(async (request, response) => {
        const requestUrl = new URL(request.url, `http://${request.headers.host}`);
    const filePath = requestUrl.pathname.split("/").filter(elem => elem !== "..");

        try {
            if (filePath[3] === "stats" && request.method === "GET") return await handleGetAllStats(request, response, filePath[4]);
            else if (filePath[3] === "emotes" && request.method === "GET") return sendResponse(response, HTTP_STATUS.OK, {emotes});
            else if (filePath[3] === "history" && request.method === "GET") return await handleGetHistory(request, response);
            else if (filePath[3] === "game-invitation" && request.method === "POST") {
                if (filePath[4] === "refuse") return await refuseGameInvitation(request, response);
                else if (filePath[4] === "leave") return await leaveFriendGame(request, response);
            }

            return sendResponse(response, HTTP_STATUS.NOT_FOUND);
        } catch (error) {
            console.warn(error);
            return sendResponse(response, HTTP_STATUS.INTERNAL_SERVER_ERROR, {error: "Invalid request"});
        }
    }
).listen(8003);

const io = new Server(server);
io.on("connection", (socket) => {
    socket.on("game-join", async (msg) => {
        await findGame(socket, msg);
    });

    socket.on("game-action", (msg) => {
        const game = games[Array.from(socket.rooms).find(room => room !== socket.id)];
        game?.players.find(p => p.id === socket.id)?.setNextDirection(msg.direction);
    });

    socket.on("emote", (msg) => {
        if (!emotes.includes(msg.emote)) {
            console.warn("Invalid emote: " + msg.emote);
            return;
        }
        const room = Array.from(socket.rooms).find(room => room !== socket.id);
        const user = getUser(socket.request);
        io.to(room).emit("emote", {emote: msg.emote, player: user.username});
    });

    socket.on("disconnecting", async () => {
        const rooms = Array.from(socket.rooms);
        const gameId = rooms[1];
        delete games[gameId];
        if (rooms.some(room => room in waitingRoomTimers)) {
            const roomName = rooms.find(room => room in waitingRoomTimers);
            delete waitingRoomTimers[roomName];
        }
    });
});

async function findGame(socket, msg) {
    if (msg.against === "computer")
        joinGame(socket, await createGame(socket, null, "computer"));
    else if (msg.against === "any-player")
        socket.join("waiting-anyone");
    else
        await joinFriendGame(socket, msg);
}

async function transferRoom(waitingRoom, gameType) {
    const sockets = await io.in(waitingRoom).fetchSockets();
    if (sockets.length < 2) return;
    if (waitingRoomTimers[waitingRoom]) {
        clearTimeout(waitingRoomTimers[waitingRoom]);
        delete waitingRoomTimers[waitingRoom];
    }
    const gameId = await createGame(sockets[0], sockets[1], gameType);
    for (let socket of sockets) {
        socket.leave(waitingRoom);
        joinGame(socket, gameId);
    }
}

async function joinFriendGame(socket, msg) {
    const user = getUser(socket.request);
    if (!user) {
        socket.emit("connect_error", {message: "Authentication needed"});
        return;
    }
    try {
        jwt.verify(msg.gameInvitationToken, process.env.GAME_INVITATION_SECRET_KEY);
    } catch (error) {
        if (error.name === "TokenExpiredError")
            socket.emit("unauthorized_room_access", {message: "Game invitation has expired. Please request a new invitation."});
        else
            socket.emit("unauthorized_room_access", {message: "You are not allowed to access this room"});
        return;
    }
    const opponentName = atob(msg.against);
    if (user.username === opponentName) {
        socket.emit("unauthorized_room_access", {message: "You cannot play against yourself"});
        return;
    }
    const response = await verifyFriendship(opponentName, socket.request.headers.authorization);
    if (!response.isFriend) {
        socket.emit("unauthorized_room_access", {message: "You are not friends with this user"});
        return;
    }
    const roomName = [opponentName, user.username].sort().join("-");
    socket.join(roomName);
    const sockets = await io.in(roomName).fetchSockets();
    if (sockets.length === 1) {
        waitingRoomTimers[roomName] = setTimeout(async () => {
            io.to(roomName).emit("game_invitation_timeout", {
                message: "Game invitation has expired. Please send a new invitation."
            });
            io.socketsLeave(roomName);
            delete waitingRoomTimers[roomName];
        }, FRIEND_GAME_TIMEOUT);
    }
    await transferRoom(roomName, "friend");
}

io.of("/").adapter.on("join-room", async (room, id) => {
    console.log(`socket ${id} has joined room ${room}`);
    if (room === "waiting-anyone") await transferRoom(room, "multiplayer");
});

const games = {};

async function createGame(p1s, p2s = null, gameType) {
    const p1 = await createPlayer(p1s);
    const p2 = await createPlayer(p2s, p1.color);
    const game = new Game(16, 9, p1, p2, gameType, 500);
    const id = randomUUID();
    games[id] = game;

    game.addEventListener("game-turn", (event) => {
        io.to(id).emit("game-turn", event.detail);
        if (event.detail.ended) {
            io.in(id).disconnectSockets();
            if (p2s && game.gameType === "multiplayer")
                updateStats(game.players, event.detail);
            updateHistory(gameInfo.players, gameInfo.grid, game.gameActions, event.detail.winner, event.detail.elapsed);
        }
    });

    game.init();
    const gameInfo = {
        players: game.players.map(player => ({
            name: player.name,
            color: player.color,
            avatar: player.avatar,
            number: player.number,
            bot: player instanceof FlowBird
        })),
        grid: structuredClone(game.grid)
    };

    Promise.all([p1s, p2s].map(socket => new Promise(resolve => {
        if (socket) socket.once("game-ready", () => resolve());
        else resolve();
    }))).then(() => {
        game.start();
        io.to(id).emit("game-start", {startTime: game.startTime});
    });
    return id;
}

async function createPlayer(socket, colorToAvoid = null) {
    if (!socket) {
        const collection = await getCollection();
        const color = colorToAvoid?.id === collection.firstChoiceColors[0].id ? collection.secondChoiceColors[0] : collection.firstChoiceColors[0];
        return new FlowBird(color, collection.spaceships[0].id);
    }
    const user = getUser(socket.request);
    const userInventorySelection = await getUserInventorySelection(user.username);
    const color = colorToAvoid?.id === userInventorySelection.firstChoiceColors.id ? userInventorySelection.secondChoiceColors : userInventorySelection.firstChoiceColors;
    return new Player(socket.id, user.username, color, userInventorySelection.spaceships.id);
}

function joinGame(socket, gameId) {
    socket.join(gameId);
    const game = games[gameId];
    socket.emit("game-info", {
        yourNumber: game.players.findIndex(player => player.id === socket.id) + 1,
        players: game.players.map(player => ({
            name: player.name,
            color: player.color,
            avatar: player.avatar,
            number: player.number
        })),
        grid: game.grid,
        playerStates: game.getPlayerStates()
    });
}

async function refuseGameInvitation(request, response) {
    const user = getUser(request);
    if (!user) {
        sendResponse(response, HTTP_STATUS.UNAUTHORIZED, {message: "Authentication needed"});
        return;
    }
    const username = user.username;
    const opponentName = await getRequestBody(request);
    const roomName = [opponentName, username].sort().join("-");
    io.to(roomName).emit("friend_invitation_refused", {
        message: `Your game invitation was refused by ${username}`
    });
    io.socketsLeave(roomName);
    delete waitingRoomTimers[roomName];
    sendResponse(response, HTTP_STATUS.OK);
}

async function leaveFriendGame(request, response) {
    const user = getUser(request);
    if (!user) {
        sendResponse(response, HTTP_STATUS.UNAUTHORIZED, {message: "Authentication needed"});
        return;
    }
    const username = user.username;
    const rawBody = await getRequestBody(request);
    const body = JSON.parse(rawBody);
    const roomName = [body.against, username].sort().join("-");
    io.to(roomName).emit("friend_invitation_refused", {
        message: `Your game invitation was refused by ${username}`
    });
    io.socketsLeave(roomName);
    sendResponse(response, HTTP_STATUS.OK);
}
