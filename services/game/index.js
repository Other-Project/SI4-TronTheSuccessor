const http = require("http");
const {Server} = require("socket.io");
const {Game} = require("./js/game.js");
const {FlowBird} = require("./js/flowbird.js");
const {Player} = require("./js/player.js");
const {randomUUID} = require('crypto');

let server = http.createServer();
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});
server.listen(8003);

io.on("connection", (socket) => {
    socket.on("game-start", (msg) => {
        findGame(socket, msg);
    });

    socket.on("game-action", (msg) => {
        const game = games[Array.from(socket.rooms).find(room => room !== socket.id)];
        game?.players.find(p => p.id === socket.id)?.setNextDirection(msg.direction);
    });

    socket.on("disconnect", () => {
        const gameId = Object.keys(socket.rooms).find(room => room !== socket.id);
        delete games[gameId];
    });
});

function findGame(socket, msg) {
    if (msg.against === "computer")
        joinGame(socket, startGame(socket));
    else socket.join("waiting-anyone");
}

async function transfertRoom(waitingRoom) {
    const sockets = await io.in(waitingRoom).fetchSockets();
    if (sockets.length < 2) return;
    const gameId = startGame(sockets[0].id, sockets[1].id);
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

function startGame(p1Id, p2Id = null) {
    let p1 = new Player(p1Id, "Player 1 (" + p1Id + ")");
    let p2 = p2Id ? new Player(p2Id, "Player 2 (" + p2Id + ")") : new FlowBird();
    const game = new Game(16, 9, p1, p2, 500);
    const id = randomUUID();
    games[id] = game;

    game.addEventListener("game-turn", (event) => {
        io.to(id).emit("game-turn", event.detail);
        if (event.detail.ended) io.in(id).disconnectSockets();
    });
    game.init();
    game.start();
    return id;
}

function joinGame(socket, gameId) {
    socket.join(gameId);
    const game = games[gameId];
    socket.emit("game-start", {
        yourNumber: game.players.findIndex(player => player.id === socket.id) + 1,
        players: game.players.map(player => ({name: player.name, color: player.color, avatar: player.avatar})),
        grid: game.grid,
        playerStates: game.getPlayerStates()
    });
}
