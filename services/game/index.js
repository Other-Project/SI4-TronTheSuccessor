const http = require("http");
const {Server} = require("socket.io");
const {Game} = require("./js/game.js");
const {FlowBird} = require("./js/flowbird.js");
const {Player} = require("./js/player.js");
const {randomUUID} = require('crypto');
const {updateStats, handleGetElo, handleGetAllStats} = require("./js/elo.js");
const {HTTP_STATUS, getUser, sendResponse} = require("./js/utils.js");

const emotes = ["animethink", "hmph", "huh", "ohgeez", "yawn"]

let server = http.createServer(async (request, response) => {
    const filePath = request.url.split("/").filter(elem => elem !== "..");

    try {
        switch (filePath[3]) {
            case "stats":
                if (request.method === "GET") await handleGetAllStats(request, response, filePath[4]);
            case "emotes":
                sendResponse(response, HTTP_STATUS.OK, {emotes});
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
    socket.on("game-start", async (msg) => {
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
        joinGame(socket, await startGame(socket));
    else socket.join("waiting-anyone");
}

async function transfertRoom(waitingRoom) {
    const sockets = await io.in(waitingRoom).fetchSockets();
    if (sockets.length < 2) return;
    const gameId = await startGame(sockets[0], sockets[1]);
    for (let socket of sockets) {
        socket.leave(waitingRoom);
        joinGame(socket, gameId);
    }
}

io.of("/").adapter.on("join-room", async (room, id) => {
    console.log(`socket ${id} has joined room ${room}`);
    if (room === "waiting-anyone") await transfertRoom(room);
});

const games = {};

async function startGame(p1s, p2s = null) {
    const game = new Game(16, 9, createPlayer(p1s), createPlayer(p2s), 500);
    const id = randomUUID();
    games[id] = game;

    game.addEventListener("game-turn", (event) => {
        io.to(id).emit("game-turn", event.detail);
        if (event.detail.ended) {
            io.in(id).disconnectSockets();
            if (p2s) updateStats(game.players, event.detail);
        }
    });
    game.init();
    game.start();
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
    socket.emit("game-start", {
        yourNumber: game.players.findIndex(player => player.id === socket.id) + 1,
        players: game.players.map(player => ({name: player.name, color: player.color, avatar: player.avatar, number: player.number})),
        grid: game.grid,
        playerStates: game.getPlayerStates()
    });
}
