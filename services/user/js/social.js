const userDatabase = require("./userDatabase.js");
const {sendResponse, getUser} = require("./utils.js");
const {HTTP_STATUS} = require("./utils.js");
const {sendFriendRequest} = require("../helper/chatHelper.js");
const {sendNotification} = require('../helper/notificationHelper.js');

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
 * Handles getting the user's friends and the pending friend requests
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
    const friends = await userDatabase.getFriends(user.username);
    const pending = await userDatabase.getPendingFriendRequests(user.username);
    const pendingForUser = await userDatabase.getPendingFriendRequestsForUser(user.username);
    const result = {friends, pending, pendingForUser};
    sendResponse(response, HTTP_STATUS.OK, result);
};

exports.handleAddFriend = async function (request, response, friend) {
    const user = getUser(request);
    if (!await checkValidity(response, user, friend)) return;
    if (await userDatabase.addToPendingFriendRequests(user.username, friend)) {
        const result = await sendFriendRequest(friend, request.headers.authorization);
        await sendNotification(true, friend, request.headers.authorization, "POST");
        sendResponse(response, HTTP_STATUS.OK, result);
        return;
    }
    if (await userDatabase.addFriend(user.username, friend)) {
        await sendNotification(false, friend, request.headers.authorization, "POST");
        sendResponse(response, HTTP_STATUS.OK, friend);
    }
    else
        sendResponse(response, HTTP_STATUS.BAD_REQUEST, {error: "Friend request already sent"});
};

exports.handleRemoveFriend = async function (request, response, friend) {
    const user = getUser(request);
    if (!await checkValidity(response, user, friend)) return;
    if (await userDatabase.removePendingFriendRequests(friend, user.username)) {
        sendResponse(response, HTTP_STATUS.OK, friend);
        await sendNotification(true, friend, request.headers.authorization, "DELETE");
        return;
    }
    if (await userDatabase.removeFriend(user.username, friend)) {
        await sendNotification(false, friend, request.headers.authorization, "DELETE");
        sendResponse(response, HTTP_STATUS.OK, friend);
    }
    else
        sendResponse(response, HTTP_STATUS.BAD_REQUEST, {error: "No friend request or you are not friends"});
};

/**
 * @param request The request
 * @param response The response
 * @param friend The username of the friend to check
 * @returns {Promise<Boolean>} Whether the user and friend are friends
 */
exports.handleTestFriend = async function (request, response, friend) {
    const user = getUser(request);
    if (!user) sendResponse(response, HTTP_STATUS.NOT_FOUND, {isFriend: false});
    const friends = await userDatabase.getFriends(user.username);
    sendResponse(response, HTTP_STATUS.OK, {isFriend: friends ? friends.includes(friend) : false});
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
