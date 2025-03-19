const {MongoClient} = require("mongodb");

const client = new MongoClient(process.env.MONGO_DB_URL ?? "mongodb://mongodb:27017");
const database = client.db("Tron-the-successor");
const historyCollection = database.collection("history");

/**
 * Add a new game to the player's history.
 */
exports.addGame = async function (playerName, playerNum, opponentName, gameActions, winner, timeElapsed) {
    await historyCollection.insertOne({
        playerId: playerName,
        playerNum: playerNum,
        opponentId: opponentName,
        result: gameActions,
        winner: winner,
        timeElapsed: timeElapsed,
        date: new Date()
    });
};

/**
 * Get the player's history.
 */
exports.getHistory = async function (playerName) {
    return await historyCollection.find({playerId: playerName}).toArray();
};
