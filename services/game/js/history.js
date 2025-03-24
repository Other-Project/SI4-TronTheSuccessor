const historyDatabase = require("./historyDatabase.js");
const {getUser, sendResponse, HTTP_STATUS} = require("./utils.js");

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
    const histories = await historyDatabase.getHistory(user.username);
    if (!histories) {
        await sendResponse(response, HTTP_STATUS.NOT_FOUND);
        return;
    }
    sendResponse(response, HTTP_STATUS.OK, histories);
};

/**
 * Update the history of a player
 * @param playerName The player's name
 * @param playerNum The player's number
 * @param opponentName The name of the opponent
 * @param gameActions The actions of both players during the game
 * @param winner The winner of the game
 * @param timeElapsed The game's duration
 * @returns {Promise<void>}
 */
exports.updateHistory = async function (playerName, playerNum, opponentName, gameActions, winner, timeElapsed) {
    await historyDatabase.addGame(playerName, playerNum, opponentName, gameActions, winner, timeElapsed);
};
