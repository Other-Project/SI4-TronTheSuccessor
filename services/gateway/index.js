// The http module contains methods to handle http queries.
const http = require("http");
const httpProxy = require("http-proxy");
const {Server} = require("socket.io");
const {io: Client} = require("socket.io-client");

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
        if (filePath[1] === "socket.io") {
            // Managed by socket.io
        }
        // If the URL starts by /api, then it's a REST request (you can change that if you want).
        else if (filePath[1] === "api") {
            if (filePath[2] === "login") {
                console.log("Request for the user service received, transferring to the user service");
                proxy.web(request, response, {target: process.env.USER_SERVICE_URL ?? "http://127.0.0.1:8004"});
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
    }
});

io.on("connection", (socket) => {
    const socketGame = Client(process.env.GAME_SERVICE_URL ?? "http://127.0.0.1:8003");
    socket.onAny((event, msg) => {
        const sessionToken = checkSessionToken(msg.sessionToken);
        if (sessionToken === "undefined")
            socket.emit("session-expired", {error: "No session token provided"});
        else if (!sessionToken)
            socket.emit("session-expired", {error: "Invalid session token"});
        else
            socketGame.emit(event, msg);
    });
    socketGame.onAny((event, msg) => {
        socket.emit(event, msg);
    });
});

checkSessionToken = (sessionToken) => {
    if (!sessionToken) {
        return "undefined";
    }

    fetch("/api/login/check-token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({sessionToken}),
    })
        .then(response => response.json())
        .then(data => {
            return data;
        })
        .catch(error => {
            console.error(error);
        });
}
