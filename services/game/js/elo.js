const eloDatabase = require("./eloDatabase.js");
const {HTTP_STATUS, getRequestBody, sendResponse} = require("./utils.js");
const BASE_ELO = 1000;

/**
 * Calculate the ELO points won.
 * @param {number} elo The ELO at the start of the game.
 * @param {number} k The development factor.
 * @param {number} w The result of the game (1 for a win, 0.5 for a draw, 0 for a defeat).
 * @param {number} d The ELO difference between the two players.
 * @returns {number} The new ELO points.
 */
function calculateEloPoints(elo, k, w, d) {
    console.debug(`ELO: ${elo}, K: ${k}, W: ${w}, D: ${d}`);
    const vD = 1 / (1 + Math.pow(10, -d / 400));
    return elo + k * (w - vD);
}

/**
 * Update the elo of both players
 * @param {Player[]} players
 * @param {{elapsed: number, winner: (string|undefined), grid: number[][], ended: boolean, draw: (boolean|undefined), playerStates: {pos: [number,number], dead: boolean, direction: "right"|"left"|"up-right"|"up-left"|"down-right"|"down-left"}[]}} gameInfo
 * @returns {Promise<void>}
 */
exports.updateElos = async function (players, gameInfo) {
    const eloP1 = await eloDatabase.getElo(players[0].name) ?? BASE_ELO;
    const eloP2 = await eloDatabase.getElo(players[1].name) ?? BASE_ELO;
    const pointP1 = gameInfo.draw ? 0.5 : players[0].name === gameInfo.winner ? 1 : 0;
    const pointP2 = 1 - pointP1;
    const diff = eloP1 - eloP2;

    const newEloP1 = Math.max(calculateEloPoints(eloP1, 32, pointP1, diff), 0);
    const newEloP2 = Math.max(calculateEloPoints(eloP2, 32, pointP2, -diff), 0);
    await eloDatabase.updateElo(players[0].name, newEloP1);
    await eloDatabase.updateElo(players[1].name, newEloP2);
    console.log(`Player ${players[0].name} has now ${newEloP1} ELO points`);
    console.log(`Player ${players[1].name} has now ${newEloP2} ELO points`);
};

/**
 * Handle a request to add an elo to the database
 * @param request The request
 * @param response The response
 * @returns {Promise<void>}
 */
exports.handleAddElo = async function (request, response) {
    const body = await getRequestBody(request);
    const parsedBody = JSON.parse(body);
    const result = await eloDatabase.addElo(parsedBody.playerId, parsedBody.elo);
    sendResponse(response, HTTP_STATUS.OK, result);
};

/**
 * Handle a request to get an elo from the database
 * @param request The request
 * @param response The response
 * @param playerId The ID of the player
 * @returns {Promise<void>}
 */
exports.handleGetElo = async function (request, response, playerId) {
    const elo = await eloDatabase.getElo(playerId);
    sendResponse(response, HTTP_STATUS.OK, elo);
};
