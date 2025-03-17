const http = require("http");
const userDatabase = require("./js/userDatabase.js");
const {getRequestBody, sendResponse} = require("./js/utils.js");
const {handleGetFriends, handleAddFriend, handleDeleteFriend} = require("./js/social.js");
const {HTTP_STATUS} = require("./js/utils.js");

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
            case "friends":
                if (request.method === "GET")
                    await handleGetFriends(request, response, filePath[4]);
                else if (filePath[4] === "add" && request.method === "POST")
                    await handleAddFriend(request, response);

                else if (filePath[4] === "delete" && request.method === "POST")
                    await handleDeleteFriend(request, response);
                break;
            default:
                sendResponse(response, HTTP_STATUS.NOT_FOUND);
        }
    } catch (error) {
        console.warn(error);
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
