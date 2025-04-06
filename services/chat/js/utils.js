const jwt = require("jsonwebtoken");

exports.HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
};

/**
 * @param {module:http.IncomingMessage} request The request object
 * @returns {Promise<string>}
 */
exports.getRequestBody = async function (request) {
    return new Promise((resolve, reject) => {
        let body = "";
        request.on("data", chunk => body += chunk.toString());
        request.on("end", () => resolve(body));
        request.on("error", reject);
    });
};

/**
 * @param {ServerResponse} response The response object
 * @param {number} statusCode The status code to send
 * @param {*} data The data to send
 */
exports.sendResponse = function (response, statusCode, data = null) {
    response.statusCode = statusCode;
    if (data) {
        response.setHeader("Content-Type", "application/json");
        response.end(JSON.stringify(data));
    } else response.end();
};

/**
 * Get the user from the request
 * @param request The request object
 * @returns {{username: string}|null}
 */
exports.getUser = function (request) {
    const authHeader = request.headers.authorization?.split(" ");
    if (!authHeader || authHeader.length !== 2 || authHeader[0] !== "Bearer") return null;
    // noinspection JSValidateTypes
    return jwt.decode(authHeader[1]);
};

/**
 * Make an HTTP request.
 * @param {URL} url The base URL of the service.
 * @param {string} method The HTTP method (e.g., 'GET', 'POST').
 * @param {string} path The request path.
 * @param {string} authorization The authorization
 * @param {Object} [data] The request payload (for 'POST' or 'PUT' methods).
 * @returns {Promise<unknown>}
 */
exports.makeHttpRequest = async function (url, method, path, authorization, data = null) {
    url = new URL(path, url);
    const response = await fetch(url,
        {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authorization
            },
            body: data ? JSON.stringify(data) : null,
        });
    if (!response.ok) {
        console.warn(`HTTP request failed with status ${response.status}`);
        return null;
    }
    const text = await response.text();
    if (!text) return null;
    return JSON.parse(text);
};
