const http = require("http");
const {Server} = require("socket.io");
const {Game} = require("./js/game.js");
const {FlowBird} = require("./js/flowbird.js");
const {Player} = require("./js/player.js");
const {randomUUID} = require("crypto");
const {updateStats, handleGetAllStats} = require("./js/elo.js");
const {updateHistory, handleGetHistory} = require("./js/history.js");
const {HTTP_STATUS, getUser, sendResponse} = require("./js/utils.js");
const {verifyFriendship} = require("./helper/userHelper.js");

const emotes = ["animethink", "hmph", "huh", "ohgeez", "yawn"];

let server = http.createServer(async (request, response) => {
    const filePath = request.url.split("/").filter(elem => elem !== "..");

    try {
        switch (filePath[3]) {
            case "stats":
                if (request.method === "GET") await handleGetAllStats(request, response, filePath[4]);
                break;
            case "emotes":
                sendResponse(response, HTTP_STATUS.OK, {emotes});
                break;
            case "history":
                if (request.method === "GET")
                    await handleGetHistory(request, response);
                break;
            default:
                sendResponse(response, HTTP_STATUS.NOT_FOUND);
        }
    } catch (error) {
        console.warn(error);
        sendResponse(response, HTTP_STATUS.INTERNAL_SERVER_ERROR, {error: "Invalid request"});
    }
}).listen(8003);

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

    socket.on("disconnect", () => {
        const gameId = Object.keys(socket.rooms).find(room => room !== socket.id);
        delete games[gameId];
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
    const opponentName = atob(msg.against);
    if (user.username === opponentName) {
        socket.emit("unauthorized_room_access", {message: "You cannot play against yourself"});
        return;
    }
    const response = await verifyFriendship(opponentName, socket.request.headers.authorization?.split(" ")[1]);
    if (!response.isFriend) {
        socket.emit("unauthorized_room_access", {message: "You are not friends with this user"});
        return;
    }
    const roomName = [opponentName, user.username].sort().join("-");
    socket.join(roomName);
    await transferRoom(roomName, "friend");
}

io.of("/").adapter.on("join-room", async (room, id) => {
    console.log(`socket ${id} has joined room ${room}`);
    if (room === "waiting-anyone") await transferRoom(room, "multiplayer");
});

const games = {};

async function createGame(p1s, p2s = null, gameType) {
    const game = new Game(16, 9, createPlayer(p1s), createPlayer(p2s), 500, gameType);
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

function createPlayer(socket) {
    if (!socket) return new FlowBird();
    const user = getUser(socket.request);
    return new Player(socket.id, user.username);
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
