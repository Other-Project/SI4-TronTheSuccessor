const jwt = require("jsonwebtoken");

const HTTP_STATUS = {
    OK: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
};
exports.HTTP_STATUS = HTTP_STATUS;

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
