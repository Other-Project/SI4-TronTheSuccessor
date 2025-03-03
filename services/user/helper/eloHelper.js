const http = require("http");

/**
 * Add ELO to a player.
 * @param {string} playerId
 * @param {number} elo
 * @returns {Promise<unknown>}
 */
async function addElo(playerId, elo) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({playerId, elo});
        const options = {
            hostname: process.env.GAME_SERVICE_HOSTNAME || 'localhost',
            port: process.env.GAME_SERVICE_PORT || 8003,
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
            resolve(JSON.parse(responseData));
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