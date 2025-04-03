const http = require("http");
const {HTTP_STATUS, sendResponse, getRequestBody, getUser} = require("./js/utils.js");
const {getCollection, getSelection, updateSelection} = require("./js/inventory-database.js");

http.createServer(async (request, response) => {
    const filePath = request.url.split("/").filter(elem => elem !== ".." && elem !== "");
    const user = getUser(request);

    if (filePath.length === 2 && request.method === "GET")
        return sendResponse(response, HTTP_STATUS.OK, await getCollection(user?.username));

    if (filePath.length === 3 && request.method === "GET")
        return sendResponse(response, HTTP_STATUS.OK, await getSelection(filePath[2]));

    if (!user) return sendResponse(response, HTTP_STATUS.UNAUTHORIZED);

    if (filePath.length === 2 && request.method === "POST") {
        const body = await getRequestBody(request);
        const selection = JSON.parse(body);
        await updateSelection(user.username, selection);
        return sendResponse(response, HTTP_STATUS.OK);
    }

    return sendResponse(response, HTTP_STATUS.NOT_FOUND);


}).listen(8002);
