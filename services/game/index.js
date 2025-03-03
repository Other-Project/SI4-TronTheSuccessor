const http = require("http");
const { Server } = require("socket.io");
const { Game } = require("./js/game.js");
const { FlowBird } = require("./js/flowbird.js");
const { Player } = require("./js/player.js");
const eloDatabase = require("./js/eloDatabase.js");


let server = http.createServer();
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

function startGame(socket, msg) {
    let game = new Game(16, 9, new Player(msg.playerName), new FlowBird(), 500);
    games[socket.id] = game;

    game.addEventListener("game-turn", async (event) => {
        socket.emit("game-turn", {
            grid: game.grid,
            playerStates: game.getPlayerStates()
        });
        if (event.detail.ended) {
            socket.emit("game-end", event.detail);
            for (const player of game.players) {
                const i = game.players.indexOf(player);
                let currentElo = eloDatabase.getElo(player.name);
                let otherPlayerElo = eloDatabase.getElo(game.players[1 - i].name);
                const newElo = calculateEloPoints(await currentElo, 32, event.detail.draw ? 0.5 : player === event.detail.winner ? 1 : 0, currentElo - otherPlayerElo);
                await eloDatabase.updateElo(player.name, newElo);
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
    const vD = 1 / (1 + Math.pow(10, -d / 400));
    return elo + k * (w - vD);
}
