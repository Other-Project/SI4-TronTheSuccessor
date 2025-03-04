// The http module contains methods to handle http queries.
const http = require("http");
const httpProxy = require("http-proxy");
const {Server} = require("socket.io");
const {io: Client} = require("socket.io-client");
const jwt = require("jsonwebtoken");
const secretKey = "FC61BBB751F52278B9C49AD4294E9668E22B3B363BA18AE5DB1170216343A357";

// We will need a proxy to send requests to the other services.
const proxy = httpProxy.createProxyServer();

// We will also need a socket to communicate with the other services.


/* The http module contains a createServer function, which takes one argument, which is the function that
 * will be called whenever a new request arrives to the server.
 */
const server = http.createServer(function (request, response) {
    // First, let's check the URL to see if it's a REST request or a file request.
    // We will remove all cases of "../" in the url for security purposes.
    let filePath = request.url.split("/").filter(function (elem) {
        return elem !== "..";
    });

    try {
        // If the URL starts by /api, then it's a REST request (you can change that if you want).
        if (filePath[1] === "api") {
            if (filePath[2] === "user") {
                console.log("Request for the user service received, transferring to the user service");
                proxy.web(request, response, {target: process.env.USER_SERVICE_URL ?? "http://127.0.0.1:8004"});
            } else if (filePath[2] === "game") {
                console.log("Request for the game service received, transferring to the game service");
                proxy.web(request, response, {target: process.env.GAME_SERVICE_URL ?? "http://127.0.1:8003"});
            }
        } else {
            console.log("Request for a file received, transferring to the file service");
            proxy.web(request, response, {target: process.env.FILES_SERVICE_URL ?? "http://127.0.0.1:8001"});
        }
    } catch (error) {
        console.log(`error while processing ${request.url}: ${error}`);
        response.statusCode = 400;
        response.end(`Something in your request (${request.url}) is strange...`);
    }
// For the server to be listening to request, it needs a port, which is set thanks to the listen function.
}).listen(8000);

const io = new Server(server, {
    cors: {
        origin: "*"
    },
    path: "/api/game"
});

io.on("connection", (socket) => {
    const accessToken = socket.request.headers.authorization?.split(" ")[1];
    if (!accessToken) {
        socket.emit("error", {status: 401});
        console.warn("No access token provided");
        socket.disconnect(true);
        return;
    }
    jwt.verify(accessToken, secretKey, (error) => {
        if (error) {
            if (error.name === "TokenExpiredError") socket.emit("error", {status: 401});
            console.error(error);
            socket.disconnect(true);
        }
    });
    const socketGame = Client(process.env.GAME_SERVICE_URL ?? "http://127.0.0.1:8003", {
        extraHeaders: {
            authorization: "Bearer " + accessToken
        },
    });

    socket.on("disconnect", () => socketGame.disconnect());
    socketGame.on("disconnect", () => socket.disconnect());

    socket.onAny((event, msg) => {
        console.log("Transmitting " + event + " event to the game service");
        socketGame.emit(event, msg);
    });
    socketGame.onAny((event, msg) => {
        console.log("Transmitting " + event + " event to the client");
        socket.emit(event, msg);
    });
});
