const http = require("http");
const userDatabase = require("./js/userDatabase.js");

const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED_STATUS_CODE: 401,
    NOT_FOUND: 404
};

http.createServer(async (request, response) => {
    const filePath = request.url.split("/").filter(elem => elem !== "..");

    try {
        switch (filePath[3]) {
            case "sign-up":
                await handleSignUp(request, response);
                break;
            case "sign-in":
                await handleSignIn(request, response);
                break;
            case "renew-access-token":
                await handleRenewToken(request, response);
                break;
            default:
                sendResponse(response, HTTP_STATUS.NOT_FOUND);
        }
    } catch (error) {
        sendResponse(response, HTTP_STATUS.BAD_REQUEST, {error: "Invalid request"});
    }
}).listen(8004);

async function handleSignUp(request, response) {
    const body = await getRequestBody(request);
    const parsedBody = JSON.parse(body);
    const result = await userDatabase.addUser(parsedBody.username, parsedBody.password);
    sendResponse(response, result.error ? HTTP_STATUS.BAD_REQUEST : HTTP_STATUS.CREATED, result);
}

async function handleSignIn(request, response) {
    const body = await getRequestBody(request);
    const parsedBody = JSON.parse(body);
    const result = await userDatabase.getUser(parsedBody.username, parsedBody.password);
    sendResponse(response, result.error ? HTTP_STATUS.BAD_REQUEST : HTTP_STATUS.OK, result);
}

async function handleRenewToken(request, response) {
    const body = await getRequestBody(request);
    const parsedBody = JSON.parse(body);
    const result = await userDatabase.renewToken(parsedBody.refreshToken);
    sendResponse(response, result.error ? HTTP_STATUS.UNAUTHORIZED_STATUS_CODE : HTTP_STATUS.OK, result);
}

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