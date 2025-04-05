const statsDatabase = require("./eloDatabase.js");
const {HTTP_STATUS, getRequestBody, sendResponse} = require("./utils.js");
const {BASE_ELO} = require("./eloDatabase.js");
const {getUser} = require("../helper/userHelper.js");

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
 * Update the stats of both players after a game.
 * @param {Player[]} players
 * @param {{elapsed: number, winner: (string|undefined), grid: number[][], ended: boolean, draw: (boolean|undefined), playerStates: {pos: [number,number], dead: boolean, direction: "right"|"left"|"up-right"|"up-left"|"down-right"|"down-left"}[]}} gameInfo
 * @returns {Promise<void>}
 */
exports.updateStats = async function (players, gameInfo) {
    const eloP1 = await statsDatabase.getElo(players[0].name) ?? BASE_ELO;
    const eloP2 = await statsDatabase.getElo(players[1].name) ?? BASE_ELO;
    const pointP1 = gameInfo.draw ? 0.5 : players[0].name === gameInfo.winner ? 1 : 0;
    const pointP2 = 1 - pointP1;
    const diff = eloP1 - eloP2;

    if (gameInfo.draw) await statsDatabase.addDraw(players[0].name, players[1].name);
    else if (players[0].name === gameInfo.winner) await statsDatabase.addWinAndLoss(players[0].name, players[1].name);
    else await statsDatabase.addWinAndLoss(players[1].name, players[0].name);
    await statsDatabase.addGame(players[0].name, gameInfo.elapsed / 1000);
    await statsDatabase.addGame(players[1].name, gameInfo.elapsed / 1000);

    const newEloP1 = Math.max(calculateEloPoints(eloP1, 64, pointP1, diff), 0);
    const newEloP2 = Math.max(calculateEloPoints(eloP2, 64, pointP2, -diff), 0);
    await statsDatabase.updateElo(players[0].name, newEloP1);
    await statsDatabase.updateElo(players[1].name, newEloP2);
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
    const result = await statsDatabase.addElo(parsedBody.playerId, parsedBody.elo);
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
    const elo = await statsDatabase.getElo(playerId);
    if (!elo) sendResponse(response, HTTP_STATUS.NOT_FOUND);
    else sendResponse(response, HTTP_STATUS.OK, elo);
};

/**
 * Handle a request to get all stats from the database
 * @param request The request
 * @param response The response
 * @param playerId The ID of the player
 * @returns {Promise<{wins: number, losses: number, draws: number, games: number, winStreak: number, rank: string, eloInRank: number, timePlayed: number} | void>}
 */
exports.handleGetAllStats = async function (request, response, playerId) {
    const result = await getUser(playerId);
    if (!result) {
        sendResponse(response, HTTP_STATUS.NOT_FOUND);
        return;
    }
    const stats = await statsDatabase.getAllStats(playerId);
    sendResponse(response, HTTP_STATUS.OK, stats);
};
