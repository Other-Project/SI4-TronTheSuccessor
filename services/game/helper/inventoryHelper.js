/**
 * Make an HTTP request.
 * @param {string} method The HTTP method (e.g., 'GET', 'POST').
 * @param {string} path The request path.
 * @param {Object} [data] The request payload (for 'POST' or 'PUT' methods).
 * @returns {Promise<unknown>}
 */
async function makeHttpRequest(method, path, data = null) {
    let url = new URL(path, process.env.INVENTORY_SERVICE_URL || 'http://localhost:8002');
    const response = await fetch(url,
        {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: data ? JSON.stringify(data) : null,
        });
    if (!response.ok) {
        console.warn(`HTTP request failed with status ${response.status}`);
        return null;
    }
    return await response.json();
}

exports.getUserInventorySelection = async function (username) {
    return makeHttpRequest('GET', `api/inventory/${username}`);
};
