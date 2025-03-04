const http = require("http");
const jwt = require("jsonwebtoken");
const {Server} = require("socket.io");
const {Game} = require("./js/game.js");
const {FlowBird} = require("./js/flowbird.js");
const {Player} = require("./js/player.js");
const {randomUUID} = require('crypto');
const eloDatabase = require("./js/eloDatabase.js");

let server = http.createServer(async (req, res) => {
    const filePath = req.url.split("/").filter(elem => elem !== "..");

    try {
        switch (filePath[1]) {
            case "elo":
                if (req.method === 'POST') await handleAddElo(req, res);
                else if (req.method === 'GET') await handleGetElo(req, res, filePath[2]);
                else {
                    res.statusCode = HTTP_STATUS.NOT_FOUND;
                    res.end();
                }
                break;
            default:
                res.statusCode = HTTP_STATUS.NOT_FOUND;
                res.end();
        }
    } catch (error) {
        res.statusCode = HTTP_STATUS.BAD_REQUEST;
        res.end(JSON.stringify({error: "Invalid request"}));
    }
})

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
    const gameId = startGame(sockets[0], sockets[1]);
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

function startGame(p1s, p2s = null) {
    const game = new Game(16, 9, createPlayer(p1s), createPlayer(p2s), 500);
    const id = randomUUID();
    games[id] = game;
async function startGame(socket, msg) {
    let game = new Game(16, 9, new Player(msg.playerName), new FlowBird(), 500);
    games[socket.id] = game;

    let eloList = [];
    for (const player of game.players) {
        let elo = await eloDatabase.getElo(player.name);
        if (elo.error) elo = await eloDatabase.addElo(player.name, 1000);
        eloList.push(elo);
    }

    game.addEventListener("game-turn", async (event) => {
        socket.emit("game-turn", {
            grid: game.grid,
            playerStates: game.getPlayerStates()
        });
        if (event.detail.ended) {
            socket.emit("game-end", event.detail);
            for (const player of game.players) {
                const i = game.players.indexOf(player);
                const newElo = calculateEloPoints(eloList[i], 32, event.detail.draw ? 0.5 : player.name === event.detail.winner ? 1 : 0, eloList[i] - eloList[1 - i]);
                await eloDatabase.updateElo(player.name, newElo);
                console.log(`Player ${player.name} has now ${newElo} ELO points`);
            }
        }
    game.addEventListener("game-turn", (event) => {
        io.to(id).emit("game-turn", event.detail);
        if (event.detail.ended) io.in(id).disconnectSockets();
    });
    game.init();
    game.start();
    return id;
}

function createPlayer(socket) {
    if (!socket) return new FlowBird();
    let user = jwt.decode(socket.request.headers.authorization?.split(" ")[1]);
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

/**
 * Calculate the ELO points won.
 * @param {number} elo The ELO at the start of the game.
 * @param {number} k The development factor.
 * @param {number} w The result of the game (1 for a win, 0.5 for a draw, 0 for a defeat).
 * @param {number} d The ELO difference between the two players.
 * @returns {number} The new ELO points.
 */
function calculateEloPoints(elo, k, w, d) {
    console.log(`ELO: ${elo}, K: ${k}, W: ${w}, D: ${d}`);
    const vD = 1 / (1 + Math.pow(10, d / 400));
    return elo + k * (w - vD);
}

async function handleAddElo(req, res) {
    const body = await getRequestBody(req);
    const parsedBody = JSON.parse(body);
    const result = await eloDatabase.addElo(parsedBody.playerId, parsedBody.elo);
    sendResponse(res, HTTP_STATUS.OK, result);
}

async function handleGetElo(req, res, playerId) {
    const elo = await eloDatabase.getElo(playerId);
    sendResponse(res, HTTP_STATUS.OK, elo);
}

async function getRequestBody(request) {
    return new Promise((resolve, reject) => {
        let body = "";
        request.on("data", chunk => body += chunk.toString());
        request.on("end", () => resolve(body));
        request.on("error", reject);
    });
}

function sendResponse(response, statusCode, data) {
    response.statusCode = statusCode;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify(data));
}
