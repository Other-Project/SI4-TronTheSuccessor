const {makeHttpRequest} = require("../js/utils.js");

/**
 * Send a notification to a user to inform them about a new friend request.
 * @param {boolean} pending whether the friend request is pending or not
 * @param {string} username the username of the user to notify
 * @param {string} authorization the authorization token to use
 * @param {string} method The HTTP method (e.g., 'GET', 'POST').
 * @returns {Promise<*>} the response from the notification service
 */
exports.sendNotification = async function (pending, username, authorization, method) {
    return makeHttpRequest(new URL(process.env.NOTIFICATION_SERVICE_URL || "http://localhost:8005"), method, `api/notification/friend`, authorization, {
        username: username,
        pending: pending
    });
};
