const {makeHttpRequest} = require("../js/utils.js");

/**
 * Notify the user about a message received.
 * @param {string} authorization The authorization token.
 * @param {string} username The username of the user to notify.
 * @returns {Promise<*>} The friends list and the pending friend requests
 */
exports.notifyMessageSent = async function (authorization, username) {
    return makeHttpRequest(new URL(process.env.NOTIFICATION_SERVICE_URL || "http://localhost:8005"), "POST", `api/notification/chat`, authorization, {username: username});
};
