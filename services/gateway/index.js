// The http module contains methods to handle http queries.
const http = require("http");
const https = require("https");
const httpProxy = require("http-proxy");
const fs = require("fs");
const {Server} = require("socket.io");
const {io: Client} = require("socket.io-client");
const jwt = require("jsonwebtoken");
const secretKey = "FC61BBB751F52278B9C49AD4294E9668E22B3B363BA18AE5DB1170216343A357";

const SERVICES = {
    "/api/user": {url: process.env.USER_SERVICE_URL ?? "http://127.0.0.1:8004"},
    "/api/game": {url: process.env.GAME_SERVICE_URL ?? "http://127.0.0.1:8003", ws: true},
    "/api/chat": {url: process.env.CHAT_SERVICE_URL ?? "http://127.0.0.1:8006", ws: true},
    "/": {url: process.env.FILES_SERVICE_URL ?? "http://127.0.0.1:8001"}
};
const HTTPS_CONFIG = process.env.SSL_ENABLED === "true" ? {
    key: process.env.SSL_KEY ?? "/ssl/key.pem",
    cert: process.env.SSL_CERT ?? "/ssl/cert.pem"
} : null;

const proxy = httpProxy.createProxyServer();

// Check if the SSL key and certificate files are accessible
if (HTTPS_CONFIG && !fs.existsSync(HTTPS_CONFIG.key, fs.constants.R_OK)) {
    console.error(`The SSL key file is not accessible at ${HTTPS_CONFIG.key}`);
    process.exit(1);
}
if (HTTPS_CONFIG && !fs.existsSync(HTTPS_CONFIG.cert, fs.constants.R_OK)) {
    console.error(`The SSL certificate file is not accessible at ${HTTPS_CONFIG.cert}`);
    process.exit(1);
}

// Register the HTTP (and HTTPS if enabled) server(s)
let server;
if (HTTPS_CONFIG) {
    http.createServer(redirectToHttps).listen(8000);
    server = https.createServer({
        key: fs.readFileSync(HTTPS_CONFIG.key),
        cert: fs.readFileSync(HTTPS_CONFIG.cert)
    }, requestHandler).listen(8443);
} else http.createServer(requestHandler).listen(8000);

// Register the websocket connections
const io = new Server(server, {path: "/ws"});
for (let servicePath in SERVICES) {
    const service = SERVICES[servicePath];
    if (service.ws) registerWebsocket(io, servicePath, service.url);
}

/**
 * Returns the URL of the service to which the request should be proxied.
 * @param request The request to process
 * @return {*|null} The URL of the service, or null if the service is not found
 */
function getService(request) {
    const path = request.url.split("/").filter(elem => elem !== "..").join("/");
    for (let service in SERVICES)
        if (path.startsWith(service)) return SERVICES[service].url;
    console.warn(`Service not found for ${request.url}`);
    return null;
}

/**
 * Redirects the request to the HTTPS port.
 */
function redirectToHttps(request, response) {
    let url = new URL(request.url, `https://${request.headers.host}`);
    url.port = process.env.HTTPS_PORT ?? "8443";
    response.writeHead(308, {"Location": url.href});
    response.end();
}

/**
 * Handles the request by proxying it to the appropriate service.
 */
function requestHandler(request, response) {
    const service = getService(request);
    if (!service) {
        responseError(request, response, "Service not found", null, 404);
        return;
    }

    try {
        proxy.web(request, response, {target: service});
        console.log(`Proxied ${request.url} to ${service}`);
    } catch (error) {
        responseError(request, response, "Proxy error", error, 502);
    }
}

/**
 * Sends an error response to the client.
 * @param request The request that caused the error
 * @param response The response object
 * @param message The message to send to the client
 * @param error The error that occurred
 * @param code The status code to send
 */
function responseError(request, response, message, error, code) {
    console.warn(`error while processing ${request.url}: ${error}`);
    response.statusCode = code;
    response.end(message);
}

/**
 * Verifies the token of the request.
 * @param request The request to verify
 * @return {Promise<boolean>} True if the token is valid, false otherwise
 */
async function verifyToken(request) {
    const authorization = request.headers.authorization?.split(" ");
    if (!authorization) {
        console.warn("No authorization header");
        return false;
    }

    if (authorization.length !== 2 || authorization[0].toLowerCase() !== "bearer") {
        console.warn("Invalid authorization header");
        return false;
    }

    const accessToken = authorization[1];
    if (!accessToken) {
        console.warn("No access token provided");
        return false;
    }

    return await new Promise((resolve) => jwt.verify(accessToken, secretKey, (error) => {
        if (error) console.warn(error);
        resolve(!error);
    }));
}

/**
 * Registers a websocket connection between the gateway and a service.
 * @param io The socket.io server
 * @param namespace The namespace of the websocket
 * @param serviceUrl The URL of the service to connect to
 */
function registerWebsocket(io, namespace, serviceUrl) {
    const nmp = io.of(namespace);

    nmp.use(async (socket, next) => {
        if (await verifyToken(socket.request)) next();
        else next(new Error("Authentication needed"));
    });

    nmp.on("connection", (socket) => {
        const serviceSocket = Client(serviceUrl, {
            extraHeaders: {authorization: socket.request.headers.authorization}
        });
        console.log("Websocket connection to " + serviceUrl + " established");

        socket.on("disconnect", () => serviceSocket.disconnect());
        serviceSocket.on("disconnect", () => socket.disconnect());

        socket.onAny((event, ...args) => {
            console.log("Transmitting " + event + " event to " + serviceUrl);
            serviceSocket.emit(event, ...args);
        });
        serviceSocket.onAny((event, ...args) => {
            console.log("Transmitting " + event + " event to the client");
            socket.emit(event, ...args);
        });
    });
}
