const {MongoClient} = require("mongodb");

const client = new MongoClient(process.env.MONGO_DB_URL ?? "mongodb://mongodb:27017");
const database = client.db("Tron-the-successor");
const historyCollection = database.collection("history");

/**
 * Add a new game to the history
 * @param players The players of the game
 * @param grid The grid of the game
 * @param gameActions The actions of all players during the game
 * @param winner The winner of the game (undefined if draw)
 * @param timeElapsed The game's duration
 */
exports.addGame = async function (players, grid, gameActions, winner, timeElapsed) {
    await historyCollection.insertOne({
        players: players,
        initialGrid: grid,
        gameActions: gameActions,
        winner: winner,
        timeElapsed: timeElapsed,
        date: new Date()
    });
};

/**
 * Get the player's history.
 * @param playerName The player's name
 * @param {string} from The timestamp from which to get the messages (optional)
 * @param limit The maximum number of games to return (Default: 10)
 */
exports.getHistory = async function (playerName, from = undefined, limit = 10) {
    let query = {
        players: {$elemMatch: {name: playerName}}
    };
    if (from)
        query.date = {$lt: typeof from === "string" ? new Date(from) : from};
    return await historyCollection.find(query).sort({date: -1}).limit(limit).toArray();
};
