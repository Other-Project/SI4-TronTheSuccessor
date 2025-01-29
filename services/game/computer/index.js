const http = require('http');
const {Server} = require("socket.io");
const {Game} = require("./js/game.js");
const {FlowBird} = require("./js/flowbird.js");
const {HumanPlayer} = require("./js/human-player.js");


let game;

let server = http.createServer();
io = new Server(server, {
    cors: {
        origin: "*",
    }
});
server.listen(8003);

io.on('connection', (socket) => {
    socket.on('game-start', () => {
        startGame();
    });

    socket.on('game-action', (msg) => {
        game.players[0].setNextDirection(msg.direction);
    });
});

function startGame() {
    let flowBird = new FlowBird();
    game = new Game(16, 9, new HumanPlayer("Player 1", 1), flowBird, 500);

    game.addEventListener("game-turn", (event) => {
        if (event.detail.ended) {
            console.log(event.detail);
            console.log("Game ended");
            io.emit('game-end', event.detail);
        }
        io.emit('game-turn', {
            grid: game.grid,
            player1Pos: game.players[0].pos,
            player1Direction: game.players[0].direction,
            player1Dead: game.players[0].dead,
            player2Pos: game.players[1].pos,
            player2Direction: game.players[1].direction,
            player2Dead: game.players[1].dead
        });
    });
    flowBird.setGame(game);
    game.start();
}
