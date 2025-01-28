const http = require('http');
const {Server} = require("socket.io");
const {Game} = require("./js/game.js");
const {FlowBird} = require("./js/flowbird.js");
const {HumanPlayer} = require("./js/human-player.js");


let game;
let refreshIntervalId;

let server = http.createServer();
io = new Server(server, {
    cors: {
        origin: "*",
    }
});
server.listen(8003);

io.on('connection', (socket) => {
    socket.on('game-start', (msg) => {
        startGame();
    });

    socket.on('game-action', (msg) => {
        game.players[0].nextDirection = msg.direction;
    });
});

function startGame() {
    let flowBird = new FlowBird();
    game = new Game(16, 9, new HumanPlayer("Player 1", 1), flowBird, 500);
    io.emit('game-turn', {game: game});
    //flowBird.setGame(game);
    game.start();

    refreshIntervalId = setInterval(() => {
        game.gameTurn();
        if (game.isGameEnded()) {
            io.emit('game-end', game.getInfo());
            stopGame();
            return;
        }
        io.emit('game-turn', {game: game});
    }, 500);
}

function stopGame() {
    clearInterval(refreshIntervalId);
}