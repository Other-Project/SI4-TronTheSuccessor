const http = require("http");
const userDatabase = require("./js/userDatabase.js");

const HTTP_STATUS = {
    OK: 200,
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
                response.statusCode = HTTP_STATUS.NOT_FOUND;
                response.end();
        }
    } catch (error) {
        response.statusCode = HTTP_STATUS.BAD_REQUEST;
        response.end(JSON.stringify({error: "Invalid request"}));
    }
}).listen(8004);

async function handleSignUp(request, response) {
    const body = await getRequestBody(request);
    const parsedBody = JSON.parse(body);
    const result = await userDatabase.addUser(parsedBody.username, parsedBody.password);
    sendResponse(response, HTTP_STATUS.OK, result);
}

async function handleSignIn(request, response) {
    const body = await getRequestBody(request);
    const parsedBody = JSON.parse(body);
    const user = await userDatabase.getUser(parsedBody.username, parsedBody.password);
    sendResponse(response, HTTP_STATUS.OK, user);
}

async function handleRenewToken(request, response) {
    const body = await getRequestBody(request);
    const parsedBody = JSON.parse(body);
    const result = await userDatabase.renewToken(parsedBody.refreshToken);
    sendResponse(response, (result.valid ? HTTP_STATUS.OK : HTTP_STATUS.UNAUTHORIZED_STATUS_CODE), result);
}

async function getRequestBody(request) {
    return new Promise((resolve, reject) => {
        let body = "";
        request.on("data", chunk => body += chunk.toString());
        request.on("end", () => resolve(body));
        request.on("error", reject);
    });
}

function sendResponse(response, statusCode, data) {
    response.statusCode = statusCode;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify(data));
}