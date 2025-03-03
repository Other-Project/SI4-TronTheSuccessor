const http = require("http");
const url = require("url");

/**
 * Add ELO to a player.
 * @param {string} playerId
 * @param {number} elo
 * @returns {Promise<unknown>}
 */
async function addElo(playerId, elo) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({playerId, elo});
        const serviceUrl = process.env.GAME_SERVICE_URL || 'http://localhost:8003';
        const {hostname, port} = new url.URL(serviceUrl);
        const options = {
            hostname: hostname,
            port: port,
            path: '/elo',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

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

        req.write(data);
        req.end();
    });
}

/**
 * Get the ELO of a player.
 * @param {string} playerId
 * @returns {Promise<unknown>}
 */
async function getElo(playerId) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: process.env.GAME_SERVICE_HOSTNAME || 'localhost',
            port: process.env.GAME_SERVICE_PORT || 8003,
            path: `/elo/${playerId}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', chunk => responseData += chunk);
            res.on('end', resolve(JSON.parse(responseData)));
            req.on('error', error => reject(error));
        });
        req.end();
    });
}

module.exports = {addElo, getElo};