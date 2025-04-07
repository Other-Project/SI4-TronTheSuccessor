// The http module contains methods to handle http queries.
const http = require("http");
const https = require("https");
const httpProxy = require("http-proxy");
const fs = require("fs");
const {Server} = require("socket.io");
const {io: Client} = require("socket.io-client");
const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET;
if (!secretKey) throw new Error("JWT_SECRET is not set");

const SERVICES = {
    "/api/user": {url: process.env.USER_SERVICE_URL ?? "http://127.0.0.1:8004"},
    "/api/inventory": {url: process.env.INVENTORY_SERVICE_URL ?? "http://127.0.0.1:8002"},
    "/api/game": {url: process.env.GAME_SERVICE_URL ?? "http://127.0.0.1:8003", ws: true},
    "/api/chat": {url: process.env.CHAT_SERVICE_URL ?? "http://127.0.0.1:8006", ws: true},
    "/": {url: process.env.FILES_SERVICE_URL ?? "http://127.0.0.1:8001"}
};
const HTTPS_CONFIG = process.env.HTTPS_ENABLED === "true" ? {
    key: process.env.HTTPS_KEY ?? "/ssl/key.pem",
    cert: process.env.HTTPS_CERT ?? "/ssl/cert.pem"
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
} else server = http.createServer(requestHandler).listen(8000);
server.keepAliveTimeout = 60000;

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

    const ip = getIpAddress(request);
    proxy.web(request, response, {target: service}, (error) => responseError(request, response, "Proxy error", error, 502));
    console.log(`Proxying ${request.url} from ${ip} to ${service}`);
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
    console.warn(`Error while processing ${request.url}: ${error}`);
    response.statusCode = code;
    response.end(message);
}

/**
 * Verifies the token of the request.
 * @param request The request to verify
 * @return {boolean} True if the token is valid, false otherwise
 */
function verifyToken(request) {
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

    try {
        jwt.verify(accessToken, secretKey);
        return true;
    } catch (error) {
        console.warn("Invalid access token", error);
        return false;
    }
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
        if (verifyToken(socket.request)) next();
        else next(new Error("Authentication needed"));
    });

    nmp.on("connection", (socket) => {
        const serviceSocket = Client(serviceUrl, {
            extraHeaders: {authorization: socket.request.headers.authorization}
        });
        const ip = getIpAddress(socket.request);
        console.log(`Websocket connection from ${ip} to ${serviceUrl} established`);

        socket.on("disconnect", () => serviceSocket.disconnect());
        serviceSocket.on("disconnect", () => socket.disconnect());

        socket.onAny((event, ...args) => {
            console.log(`Transmitting ${event} event from ${ip} (${socket.id}) to ${serviceUrl} (${serviceSocket.id})`);
            serviceSocket.emit(event, ...args);
        });
        serviceSocket.onAny((event, ...args) => {
            console.log(`Transmitting ${event} event from ${serviceUrl} (${serviceSocket.id}) to ${ip} (${socket.id})`);
            socket.emit(event, ...args);
        });
    });
}

/**
 * Returns the IP address of the request.
 * @param request The request to process
 * @returns {string} The IP address of the request
 */
function getIpAddress(request) {
    return request.headers["x-forwarded-for"] || request.socket.remoteAddress;
}
