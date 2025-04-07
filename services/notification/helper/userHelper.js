/**
 * Make an HTTP request.
 * @param {string} method The HTTP method (e.g., 'GET', 'POST').
 * @param {string} path The request path.
 * @param {string} authorization The authorization
 * @param {Object} [data] The request payload (for 'POST' or 'PUT' methods).
 * @returns {Promise<unknown>}
 */
async function makeHttpRequest(method, path, authorization, data = null) {
    let url = new URL(process.env.USER_SERVICE_URL || "http://localhost:8004");
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
 * Get the friends list and the pending friend requests.
 * @param authorization The authorization
 * @returns {Promise<*>} The friends list and the pending friend requests
 */
exports.getFriendsList = async function (authorization) {
    return makeHttpRequest("GET", `api/user/friends`, authorization);
};
