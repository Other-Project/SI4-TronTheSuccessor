const http = require("http");
const url = require("url");

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

        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', chunk => responseData += chunk);
            res.on('end', () => {
                if (responseData) {
                    try {
                        resolve(JSON.parse(responseData));
                    } catch (error) {
                        reject(new Error("Failed to parse response JSON"));
                    }
                } else resolve();
            });
        });
        req.on('error', error => reject(error));
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

/**
 * Add ELO to a player.
 * @param {string} playerId
 * @param {number} elo
 * @returns {Promise<unknown>}
 */
async function addElo(playerId, elo) {
    const data = {playerId, elo};
    return makeHttpRequest('POST', '/api/game/elo', data);
}

module.exports = {addElo};

/**
 * Get the ELO of a player.
 * @param {string} playerId
 * @returns {Promise<unknown>}
 */
async function getElo(playerId) {
    return makeHttpRequest('GET', `/api/game/elo/${playerId}`);
}

module.exports = {addElo, getElo};