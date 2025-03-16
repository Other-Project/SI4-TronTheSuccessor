const http = require("http");
const url = require("url");
const {getRequestBody} = require("../js/utils.js");

/**
 * Make an HTTP request.
 * @param {string} method The HTTP method (e.g., 'GET', 'POST').
 * @param {string} path The request path.
 * @param {Object} [data] The request payload (for 'POST' or 'PUT' methods).
 * @returns {Promise<unknown>}
 */
async function makeHttpRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const serviceUrl = process.env.GAME_SERVICE_URL || 'http://localhost:8003';
        const {hostname, port} = new url.URL(serviceUrl);
        const options = {
            hostname: hostname,
            port: port,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (data) options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));

        const request = http.request(options, async (req) => {
            const responseData = await getRequestBody(req);
            resolve(JSON.parse(responseData));
        });
        request.on('error', error => reject(error));

        if (data) request.write(JSON.stringify(data));
        request.end();
    });
}

/**
 * Add ELO and initialize his stats
 * @param {string} playerId
 * @param {number} elo
 * @returns {Promise<unknown>}
 */
async function addStats(playerId, elo) {
    const data = {playerId, elo};
    return makeHttpRequest('POST', '/api/game/stats', data);
}

/**
 * Get the ELO of a player.
 * @param {string} playerId
 * @returns {Promise<unknown>}
 */
async function getElo(playerId) {
    return makeHttpRequest('GET', `/api/game/elo/${playerId}`);
}

module.exports = {addElo: addStats, getElo};