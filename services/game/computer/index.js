const http = require('http');
const {Server} = require("socket.io");
const {Game} = require("./js/game.js");
const {FlowBird} = require("./js/flowbird.js");
const {HumanPlayer} = require("./js/human-player.js");

let game = new Game(16, 9, new HumanPlayer("Player 1", 1), new HumanPlayer("Player 2", 2), 500);

console.log("Game created");


const server = http.createServer();
const io = new Server(server, {
    cors: {
        origin: "*",
    }
});
server.listen(8003)

io.on('connection', (socket) => {
    socket.on('Message to game', (msg) => {
        console.log('message: ' + msg);
        setTimeout(() => socket.emit('Message to client', msg), 1000);
    });
});
