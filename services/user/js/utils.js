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
 *
 * @param {IncomingMessage} request
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

exports.sendResponse = function (response, statusCode, data = null) {
    response.statusCode = statusCode;
    if (data) {
        response.setHeader("Content-Type", "application/json");
        response.end(JSON.stringify(data));
    } else response.end();
};

/**
 * Get the authorization token from the request
 * @param request The request object
 * @returns {string|null}
 */
exports.getAuthorizationToken = function (request) {
    const authHeader = request.headers.authorization?.split(" ");
    if (!authHeader || authHeader.length !== 2 || authHeader[0] !== "Bearer") return null;
    return authHeader[1];
};

exports.getUser = function (request) {
    const token = exports.getAuthorizationToken(request);
    if (!token) return null;
    return jwt.decode(token);
};
