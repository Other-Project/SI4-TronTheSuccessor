const http = require("http");
const userDatabase = require("./js/userDatabase.js");

const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED_STATUS_CODE: 401,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
};

http.createServer(async (request, response) => {
    const filePath = request.url.split("/").filter(elem => elem !== "..");

    try {
        if (filePath.length < 4) {
            sendResponse(response, HTTP_STATUS.NOT_FOUND);
        }
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
            case "security-questions":
                await handleSecurityQuestions(request, response);
                break;
            case "verify-answers":
                await handleVerifyAnswers(request, response);
                break;
            case "reset-password":
                await handleResetPassword(request, response);
                break;
            default:
                sendResponse(response, HTTP_STATUS.NOT_FOUND);
        }
    } catch (error) {
        console.warn(error);
        sendResponse(response, HTTP_STATUS.INTERNAL_SERVER_ERROR, {error: "Invalid request"});
    }
}).listen(8004);

async function handleSignUp(request, response) {
    const body = await getRequestBody(request);
    const parsedBody = JSON.parse(body);
    const result = await userDatabase.addUser(parsedBody.username, parsedBody.password, parsedBody.securityQuestions);
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

async function handleSecurityQuestions(request, response) {
    const body = await getRequestBody(request);
    const parsedBody = (body && JSON.parse(body)) || {};
    const result = await userDatabase.getSecurityQuestions(parsedBody.username);
    sendResponse(response, result.error ? HTTP_STATUS.BAD_REQUEST : HTTP_STATUS.OK, result);
}

async function handleVerifyAnswers(request, response) {
    const body = await getRequestBody(request);
    const parsedBody = JSON.parse(body);
    const result = await userDatabase.verifyAnswers(parsedBody.username, parsedBody.answers);
    sendResponse(response, result.error ? HTTP_STATUS.BAD_REQUEST : HTTP_STATUS.OK, result);
}

async function handleResetPassword(request, response) {
    const body = await getRequestBody(request);
    const parsedBody = JSON.parse(body);
    let resetPasswordToken;
    try {
        resetPasswordToken = request.headers.cookie.split("resetPasswordToken=")[1].split(";")[0];
    } catch (error) {
        resetPasswordToken = "";
    }
    const result = await userDatabase.resetPassword(parsedBody.newPassword, resetPasswordToken);
    sendResponse(response, result.error ? HTTP_STATUS.BAD_REQUEST : HTTP_STATUS.OK, result);
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
