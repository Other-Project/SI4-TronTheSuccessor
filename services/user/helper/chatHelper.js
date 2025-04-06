const {makeHttpRequest} = require("../js/utils.js");

/**
 * Send a friend request to another user.
 * @param friend the username of the friend to send the request to
 * @param authorization the authorization token
 * @returns {Promise<*>} the response from the chat service
 */
exports.sendFriendRequest = async function (friend, authorization) {
    const message = {
        type: "friend-request", content: "Hey, let's be friends!"
    };
    return makeHttpRequest(new URL(process.env.CHAT_SERVICE_URL || "http://localhost:8006"), 'POST', `api/chat/${friend}`, authorization, message);
};
