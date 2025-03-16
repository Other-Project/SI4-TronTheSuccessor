const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED_STATUS_CODE: 401,
    NOT_FOUND: 404
};

/**
 *
 * @param {IncomingMessage} request
 * @returns {Promise<string>}
 */
async function getRequestBody(request) {
    return new Promise((resolve, reject) => {
        let body = "";
        request.on("data", chunk => body += chunk.toString());
        request.on("end", () => resolve(body));
        request.on("error", reject);
    });
}

function sendResponse(response, statusCode, data = null) {
    response.statusCode = statusCode;
    if (data) {
        response.setHeader("Content-Type", "application/json");
        response.end(JSON.stringify(data));
    } else response.end();
}

module.exports = {HTTP_STATUS, getRequestBody, sendResponse};
