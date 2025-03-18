const userDatabase = require("./userDatabase.js");
const {getRequestBody, sendResponse, getUser} = require('./utils.js');
const {HTTP_STATUS} = require('./utils.js');
const {sendFriendRequest} = require('../helper/chatHelper.js');

/**
 * Handles checking if the user exists
 * @param request The request
 * @param response The response
 * @param username The username to check
 * @returns {Promise<void>}
 */
exports.handleGetUser = async function handleGetUser(request, response, username) {
    const result = await userDatabase.getUser(username);
    if (!result) {
        sendResponse(response, HTTP_STATUS.NOT_FOUND, {error: "User not found"});
        return;
    }
    sendResponse(response, HTTP_STATUS.OK, username);
};

/**
 * Handles getting the user's friends
 * @param request
 * @param response
 * @returns {Promise<void>}
 */
exports.handleGetFriends = async function (request, response) {
    const user = getUser(request);
    if (!user) {
        sendResponse(response, HTTP_STATUS.UNAUTHORIZED);
        return;
    }
    const result = await userDatabase.getFriends(user.username);
    sendResponse(response, HTTP_STATUS.OK, result);
}

/**
 * Adds a friend to the user's pending friend requests
 * @param request The request
 * @param response The response
 * @returns {Promise<void>}
 */
exports.handleAddToPendingFriendRequests = async function (request, response) {
    const body = await getRequestBody(request);
    const parsedBody = JSON.parse(body);
    const user = getUser(request);
    if (!user) {
        sendResponse(response, HTTP_STATUS.UNAUTHORIZED);
        return;
    }
    const friends = await userDatabase.getUser(parsedBody.friends);
    if (!friends) {
        sendResponse(response, HTTP_STATUS.NOT_FOUND);
        return;
    }
    if (user.username === parsedBody.friends) {
        sendResponse(response, HTTP_STATUS.BAD_REQUEST, {error: "You cannot add yourself as a friend"});
        return;
    }
    const pending = await userDatabase.addToPendingFriendRequests(user.username, parsedBody.friends);
    if (pending) {
        sendResponse(response, HTTP_STATUS.BAD_REQUEST, {error: "Friend requests already sent"});
        return;
    }
    const result = await sendFriendRequest(user.username, parsedBody.friends, request.headers.authorization?.split(" ")[1]);
    sendResponse(response, HTTP_STATUS.OK, result);
};

/**
 * Handles adding or removing friends from the user's friend list
 * @param request The request
 * @param response The response
 * @param add Whether to add or remove the friends
 * @returns {Promise<void>}
 */
exports.handleModifyFriendList = async function (request, response, add) {
    const body = await getRequestBody(request);
    const parsedBody = JSON.parse(body);
    const user = getUser(request);
    if (!user) {
        sendResponse(response, HTTP_STATUS.UNAUTHORIZED);
        return;
    }
    const friends = await userDatabase.getUser(parsedBody.friends);
    if (!friends) {
        sendResponse(response, HTTP_STATUS.NOT_FOUND);
        return;
    }
    if (user.username === parsedBody.friends) {
        sendResponse(response, HTTP_STATUS.BAD_REQUEST, {error: "You cannot add or remove yourself as a friend"});
        return;
    }
    const result = add
        ? await userDatabase.addFriend(user.username, parsedBody.friends)
        : await userDatabase.removeFriend(user.username, parsedBody.friends);
    sendResponse(response, HTTP_STATUS.OK, result);
}
