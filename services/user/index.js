const http = require("http");
const userDatabase = require("./js/userDatabase.js");
const {HTTP_STATUS, getAuthorizationToken, getRequestBody, sendResponse} = require("./js/utils.js");
const {
    handleGetFriends,
    handleGetUser,
    handleRemoveFriend,
    handleAddFriend,
    handleTestFriend
} = require("./js/social.js");

http.createServer(async (request, response) => {
    const filePath = request.url.split("/").filter(elem => elem !== "..");

    try {
        if (filePath.length < 4) return sendResponse(response, HTTP_STATUS.NOT_FOUND);
        if (filePath[3] === "sign-up" && request.method === "POST") return await handleSignUp(request, response);
        else if (filePath[3] === "sign-in" && request.method === "POST") return await handleSignIn(request, response);
        else if (filePath[3] === "renew-access-token" && request.method === "GET") return await handleRenewToken(request, response);
        else if (filePath[3] === "security-questions" && request.method === "POST") return await handleSecurityQuestions(request, response);
        else if (filePath[3] === "verify-answers" && request.method === "POST") return await handleVerifyAnswers(request, response);
        else if (filePath[3] === "reset-password" && request.method === "POST") return await handleResetPassword(request, response);
        else if (filePath[3] === "check" && request.method === "GET") return await handleGetUser(request, response, filePath[4]);
        else if (filePath[3] === "friends") {
            if (request.method === "GET") {
                if (filePath[5] === "status") return await handleTestFriend(request, response, filePath[4]);
                else return await handleGetFriends(request, response);
            } else if (request.method === "POST") return await handleAddFriend(request, response, filePath[4]);
            else if (request.method === "DELETE") return await handleRemoveFriend(request, response, filePath[4]);
        } else if (request.method === "GET" && filePath[4] === "avatar") return await userDatabase.handleGetAvatar(request, response, filePath[3]);

        return sendResponse(response, HTTP_STATUS.NOT_FOUND);
    } catch (error) {
        console.warn(error);
        return sendResponse(response, HTTP_STATUS.INTERNAL_SERVER_ERROR, {error: "Invalid request"});
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
    const result = await userDatabase.loginUser(parsedBody.username, parsedBody.password);
    sendResponse(response, result.error ? HTTP_STATUS.BAD_REQUEST : HTTP_STATUS.OK, result);
}

async function handleRenewToken(request, response) {
    const refreshToken = getAuthorizationToken(request);
    const result = await userDatabase.renewToken(refreshToken);
    sendResponse(response, result.error ? HTTP_STATUS.UNAUTHORIZED : HTTP_STATUS.OK, result);
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
        resetPasswordToken = request.headers["authorization"].split("Bearer ")[1];
    } catch (error) {
        resetPasswordToken = "";
    }
    const result = await userDatabase.resetPassword(parsedBody.newPassword, resetPasswordToken);
    sendResponse(response, result.error ? HTTP_STATUS.BAD_REQUEST : HTTP_STATUS.OK, result);
}
