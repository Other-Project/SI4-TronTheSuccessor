const {makeHttpRequest} = require("../js/utils.js");

/**
 * Send a notification to a user to inform them about a new friend request.
 * @param {string} method The HTTP method (e.g., 'GET', 'POST').
 * @param {string} username the username of the user to notify
 * @param {string} authorization the authorization token to use
 * @returns {Promise<*>} the response from the notification service
 */
exports.sendNotification = async function (username, authorization, method) {
    return makeHttpRequest(new URL(process.env.NOTIFICATION_SERVICE_URL || "http://localhost:8005"), method, `api/notification/friend`, authorization, {username: username});
};
