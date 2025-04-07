const {makeHttpRequest} = require("../js/utils.js");

/**
 * Get the friends list and the pending friend requests.
 * @param authorization The authorization
 * @returns {Promise<*>} The friends list and the pending friend requests
 */
exports.getFriendsList = async function (authorization) {
    return makeHttpRequest(new URL(process.env.USER_SERVICE_URL || "http://localhost:8004"), "GET", `api/user/friends`, authorization);
};
