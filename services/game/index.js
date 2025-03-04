const http = require("http");
const jwt = require("jsonwebtoken");
const {Server} = require("socket.io");
const {Game} = require("./js/game.js");
const {FlowBird} = require("./js/flowbird.js");
const {Player} = require("./js/player.js");
const {randomUUID} = require('crypto');
const eloDatabase = require("./js/eloDatabase.js");

const HTTP_STATUS = {
    OK: 200,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
};

const BASE_ELO = 1000;

let server = http.createServer(async (request, response) => {
    const filePath = request.url.split("/").filter(elem => elem !== "..");

    try {
        switch (filePath[3]) {
            case "elo":
                if (request.method === "POST") await handleAddElo(request, response);
                else if (request.method === "GET") await handleGetElo(request, response, filePath[4]);
                else {
                    response.statusCode = HTTP_STATUS.NOT_FOUND;
                    response.end();
                }
                break;
            default:
                response.statusCode = HTTP_STATUS.NOT_FOUND;
                response.end();
        }
    } catch (error) {
        console.warn(error);
        sendResponse(response, HTTP_STATUS.INTERNAL_SERVER_ERROR, {error: "Invalid request"});
    }
}).listen(8003);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

io.on("connection", (socket) => {
    socket.on("game-start", async (msg) => {
        await findGame(socket, msg);
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
            if (p2s) updateElos(game.players, event.detail);
        }
    });
    game.init();
    game.start();
    return id;
}

/**
 * Update the elo of both players
 * @param {Player[]} players
 * @param {{elapsed: number, winner: (string|undefined), grid: number[][], ended: boolean, draw: (boolean|undefined), playerStates: {pos: [number,number], dead: boolean, direction: "right"|"left"|"up-right"|"up-left"|"down-right"|"down-left"}[]}} gameInfo
 * @returns {Promise<void>}
 */
async function updateElos(players, gameInfo) {
    const eloP1 = await eloDatabase.getElo(players[0].name) ?? BASE_ELO;
    const eloP2 = await eloDatabase.getElo(players[1].name) ?? BASE_ELO;
    const pointP1 = gameInfo.draw ? 0.5 : players[0].name === gameInfo.winner ? 1 : 0;
    const pointP2 = 1 - pointP1;
    const diff = eloP1 - eloP2;

    const newEloP1 = Math.max(calculateEloPoints(eloP1, 32, pointP1, diff), 0);
    const newEloP2 = Math.max(calculateEloPoints(eloP2, 32, pointP2, -diff), 0);
    await eloDatabase.updateElo(players[0].name, newEloP1);
    await eloDatabase.updateElo(players[1].name, newEloP2);
    console.log(`Player ${players[0].name} has now ${newEloP1} ELO points`);
    console.log(`Player ${players[1].name} has now ${newEloP2} ELO points`);
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

/**
 * Handle a request to add an elo to the database
 * @param request The request
 * @param response The response
 * @returns {Promise<void>}
 */
async function handleAddElo(request, response) {
    const body = await getRequestBody(request);
    const parsedBody = JSON.parse(body);
    const result = await eloDatabase.addElo(parsedBody.playerId, parsedBody.elo);
    sendResponse(response, HTTP_STATUS.OK, result);
}

async function handleGetElo(request, response, playerId) {
    const elo = await eloDatabase.getElo(playerId);
    sendResponse(response, HTTP_STATUS.OK, elo);
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
