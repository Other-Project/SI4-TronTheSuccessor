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
    if (!await checkValidity(response, user, parsedBody.friends)) return;
    if (!await userDatabase.addToPendingFriendRequests(user.username, parsedBody.friends)) {
        sendResponse(response, HTTP_STATUS.BAD_REQUEST, {error: "Friend requests already sent"});
        return;
    }
    const result = await sendFriendRequest(user.username, parsedBody.friends, request.headers.authorization);
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
    if (!await checkValidity(response, user, parsedBody.friends)) return;
    const result = add
        ? await userDatabase.addFriend(user.username, parsedBody.friends)
        : await userDatabase.removeFriend(user.username, parsedBody.friends);
    if (!result) {
        sendResponse(response, HTTP_STATUS.BAD_REQUEST, {error: "No friend request or you are already friends"});
        return;
    }
    sendResponse(response, HTTP_STATUS.OK, result);
}
/**
 * Handles refusing a friend request
 * @param request The request
 * @param response The response
 * @returns {Promise<void>}
 */
exports.handleRefuseFriendRequest = async function (request, response) {
    const body = await getRequestBody(request);
    const parsedBody = JSON.parse(body);
    const user = getUser(request);
    if (!await checkValidity(response, user, parsedBody.friends)) return;
    const result = await userDatabase.removePendingFriendRequests(user.username, parsedBody.friends);
    sendResponse(response, HTTP_STATUS.OK, result);
};

/**
 * Checks if the request is valid for adding or removing friends
 * @param response The response
 * @param user The user
 * @param friend The friend
 * @returns {Promise<boolean>} Whether the request is valid
 */
async function checkValidity(response, user, friend) {
    if (!user) {
        sendResponse(response, HTTP_STATUS.UNAUTHORIZED);
        return false;
    }
    const friends = await userDatabase.getUser(friend);
    if (!friends) {
        sendResponse(response, HTTP_STATUS.NOT_FOUND);
        return false;
    }
    if (user.username === friend) {
        sendResponse(response, HTTP_STATUS.BAD_REQUEST, {error: "You cannot add or remove yourself as a friend"});
        return false;
    }
    return true;
}
