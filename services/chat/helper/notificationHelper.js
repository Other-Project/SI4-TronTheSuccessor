/**
 * Make an HTTP request.
 * @param {string} method The HTTP method (e.g., 'GET', 'POST').
 * @param {string} path The request path.
 * @param {string} authorization The authorization
 * @param {Object} [data] The request payload (for 'POST' or 'PUT' methods).
 * @returns {Promise<unknown>}
 */
async function makeHttpRequest(method, path, authorization, data = null) {
    let url = new URL(process.env.NOTIFICATION_SERVICE_URL || "http://localhost:8005");
    url += path;
    const response = await fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authorization
        },
        body: data ? JSON.stringify(data) : null
    });
    if (!response.ok) {
        console.warn(`HTTP request failed with status ${response.status}`);
        return null;
    }
    const text = await response.text();
    if (!text) return null;
    return JSON.parse(text);
}

/**
 * Notify the user about a message received.
 * @param {string} authorization The authorization token.
 * @param {string} username The username of the user to notify.
 * @returns {Promise<*>} The friends list and the pending friend requests
 */
exports.notifyMessageSent = async function (authorization, username) {
    return makeHttpRequest("POST", `api/notification/chat`, authorization, {username: username});
};
