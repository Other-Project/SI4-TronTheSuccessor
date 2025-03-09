const http = require("http");
const chatDatabase = require("./js/chatDatabase.js");
const {HTTP_STATUS, sendResponse, getRequestBody, getUser} = require("./js/utils.js");


http.createServer(async (request, response) => {
    // noinspection HttpUrlsUsage
    const requestUrl = new URL(request.url, `http://${request.headers.host}`);
    const user = getUser(request);
    if (!user) return sendResponse(response, HTTP_STATUS.UNAUTHORIZED);

    const endpoint = /^\/api\/chat\/([a-zA-Z0-9]+)\/?$/;
    if (endpoint.test(requestUrl.pathname)) {
        let roomId = endpoint.exec(requestUrl.pathname)[1];
        if (roomId !== "global") roomId = user.username + "-" + roomId;

        if (request.method === "GET") {
            const from = requestUrl.searchParams.get("from");
            const messages = await chatDatabase.getChat(roomId, from);
            return sendResponse(response, HTTP_STATUS.OK, messages);
        } else if (request.method === "POST") {
            const message = JSON.parse(await getRequestBody(request));
            await chatDatabase.storeMessage(roomId, user.username, message.type, message.content);
            return sendResponse(response, HTTP_STATUS.CREATED);
        }
    } else return sendResponse(response, HTTP_STATUS.NOT_FOUND);
}).listen(8006);
