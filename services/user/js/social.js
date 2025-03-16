const userDatabase = require("./userDatabase.js");
const {getRequestBody, sendResponse} = require('./utils.js');
const {HTTP_STATUS} = require('./utils.js');

async function handleGetFriends(request, response, username) {
    const result = await userDatabase.getFriends(username);
    sendResponse(response, HTTP_STATUS.OK, result);
}

async function handleAddFriend(request, response) {
    const body = await getRequestBody(request);
    const parsedBody = JSON.parse(body);
    const result = await userDatabase.addFriend(parsedBody.username, parsedBody.friends);
    sendResponse(response, HTTP_STATUS.OK, result);
}

async function handleDeleteFriend(request, response) {
    const body = await getRequestBody(request);
    const parsedBody = JSON.parse(body);
    const result = await userDatabase.removeFriend(parsedBody.username, parsedBody.friends);
    sendResponse(response, HTTP_STATUS.OK, result);
}

module.exports = {handleGetFriends, handleAddFriend, handleDeleteFriend};
