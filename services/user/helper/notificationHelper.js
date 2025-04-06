const {makeHttpRequest} = require("../js/utils.js");

/**
 * Send a notification to a user to inform them about a new friend request.
 * @param user the username of the user to notify
 * @param authorization the authorization token
 * @returns {Promise<*>} the response from the notification service
 */
exports.sendNotification = async function (user, authorization) {
    return makeHttpRequest(new URL(process.env.NOTIFICATION_SERVICE_URL || "http://localhost:8005"), 'POST', `api/notification/friend`, authorization, user);
};