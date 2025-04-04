/**
 * Make an HTTP request.
 * @param {string} method The HTTP method (e.g., 'GET', 'POST').
 * @param {string} path The request path.
 * @param {Object} [data] The request payload (for 'POST' or 'PUT' methods).
 * @param {string} [authorization] The authorization token (if needed).
 * @returns {Promise<unknown>}
 */
async function makeHttpRequest(method, path, data = null, authorization = null) {
    let url = new URL(process.env.USER_SERVICE_URL || "http://localhost:8003");
    url += path;
    const response = await fetch(url,
        {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": authorization
            },
            body: data ? JSON.stringify(data) : null
        });
    if (!response.ok) {
        console.warn(`HTTP request failed with status ${response.status}`);
        return null;
    }
    return await response.json();
}

exports.getUser = async function (username) {
    return await makeHttpRequest("GET", `api/user/check/${username}`);
};

exports.verifyFriendship = async function (friend, authorization) {
    return await makeHttpRequest("GET", `api/user/friends/${friend}/status`, null, authorization);
};
