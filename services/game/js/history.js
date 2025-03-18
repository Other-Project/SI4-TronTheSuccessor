const historyDatabase = require("./historyDatabase.js");
const {getUser, sendResponse, HTTP_STATUS} = require("./utils.js");

/**
 * Get the history of a user
 * @param request The request
 * @param response The response
 * @param username The username of the user
 * @returns {Promise<void>}
 */
exports.handleGetHistory = async function (request, response, username) {
    let user = await getUser(request);
    if (!user || user.username !== username) {
        await sendResponse(response, HTTP_STATUS.UNAUTHORIZED);
        return;
    }
    const histories = await historyDatabase.getHistory(username);
    if (!histories) {
        await sendResponse(response, HTTP_STATUS.NOT_FOUND);
        return;
    }
    sendResponse(response, HTTP_STATUS.OK, histories);
};

/**
 * Update the histories of the players
 * @param players Array of players
 * @param gameActions Array of the actions the players made
 * @param winner The winner of the game
 * @param timeElapsed The time it took to finish the game
 * @returns {Promise<void>}
 */
exports.updateHistories = async function (players, gameActions, winner, timeElapsed) {
    for (let i = 0; i < players.length; i++) {
        await historyDatabase.addGame(players[i].name, i + 1, players[1 - i].name, gameActions, winner ? winner === players[i].name : undefined, timeElapsed);
    }
};
