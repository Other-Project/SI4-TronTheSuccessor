const historyDatabase = require("./historyDatabase.js");
const {getUser, sendResponse, HTTP_STATUS, getRequestBody} = require("./utils.js");

/**
 * Get the history of a user
 * @param request The request
 * @param response The response
 * @returns {Promise<void>}
 */
exports.handleGetHistory = async function (request, response) {
    let user = getUser(request);
    if (!user) {
        await sendResponse(response, HTTP_STATUS.UNAUTHORIZED);
        return;
    }
    const url = new URL(request.url, `http://${request.headers.host}`);
    const from = url.searchParams.get("from") || null;
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const histories = await historyDatabase.getHistory(user.username, from, limit);
    if (!histories) {
        await sendResponse(response, HTTP_STATUS.NOT_FOUND);
        return;
    }
    sendResponse(response, HTTP_STATUS.OK, histories);
};

/**
 * Update the history
 * @param players The players of the game
 * @param grid The grid of the game
 * @param gameActions The actions of all players during the game
 * @param winner The winner of the game (undefined if draw)
 * @param timeElapsed The game's duration
 */
exports.updateHistory = async function (players, grid, gameActions, winner, timeElapsed) {
    await historyDatabase.addGame(players, grid, gameActions, winner, timeElapsed);
};
