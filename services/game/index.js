const http = require("http");
const { Server } = require("socket.io");
const { Game } = require("./js/game.js");
const { FlowBird } = require("./js/flowbird.js");
const { Player } = require("./js/player.js");
const eloDatabase = require("./js/eloDatabase.js");

const HTTP_STATUS = {
    OK: 200,
    BAD_REQUEST: 400,
    NOT_FOUND: 404
};

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

const games = {};

io.on("connection", (socket) => {
    socket.on("game-start", (msg) => {
        startGame(socket, msg);
    });

    socket.on("game-action", (msg) => {
        if (games[socket.id]?.players[msg.number - 1])
            games[socket.id].players[msg.number - 1].setNextDirection(msg.direction);
    });

    socket.on("disconnect", () => {
        delete games[socket.id];
    });
});

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
    });
    game.init();
    game.start();

    socket.emit("game-start", {
        yourNumber: 1, // TODO: The current player won't always be the first one
        players: game.players,
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
