/**
 * Make an HTTP request.
 * @param {string} method The HTTP method (e.g., 'GET', 'POST').
 * @param {string} path The request path.
 * @param {string} token The auth token
 * @param {Object} [data] The request payload (for 'POST' or 'PUT' methods).
 * @returns {Promise<unknown>}
 */
async function makeHttpRequest(method, path, token, data = null,) {
    let url = new URL(process.env.CHAT_SERVICE_URL || "http://localhost:8006");
    url += path;
    const response = await fetch(
        url,
        {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: data ? JSON.stringify(data) : null,
        });
    if (!response.ok) {
        console.warn(`HTTP request failed with status ${response.status}`);
        return null;
    }
    const text = await response.text();
    if (!text) return null;
    return JSON.parse(text);
}

exports.sendFriendRequest = async function (username, friend, token) {
    const message = {
        type: "friend-request",
        content: "Hey, let's be friends!"
    };
    return makeHttpRequest('POST', `api/chat/${friend}`, token, message);
};
