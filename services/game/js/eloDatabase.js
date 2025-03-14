const {MongoClient} = require("mongodb");

const client = new MongoClient(process.env.MONGO_DB_URL ?? 'mongodb://mongodb:27017');
const database = client.db("Tron-the-successor");
const statsCollection = database.collection("stats");

/**
 * Add a new ELO to the database.
 * @param {string} playerId The ID of the player.
 * @param {number} elo The ELO of the player.
 * @returns {Promise<number>}
 */
async function addElo(playerId, elo) {
    await statsCollection.insertOne({playerId, elo});
    return elo;
}

/**
 * Get the ELO of a player.
 * @param {string} playerId
 * @returns {Promise<number|null>}
 */
async function getElo(playerId) {
    const elo = await statsCollection.findOne({playerId});
    return elo?.elo ?? null;
}

/**
 * Update the ELO of a player.
 * @param playerId
 * @param newElo
 * @returns {Promise<number>}
 */
async function updateElo(playerId, newElo) {
    await statsCollection.updateOne(
        {playerId},
        {$set: {elo: newElo}},
        {upsert: true}
    );
    return newElo;
}

/**
 * Get all ELOs.
 * @returns {Promise<[]>}
 */
async function getAllElo() {
    return await statsCollection.find({}).toArray();
}

/**
 * Add a game to the player's stats.
 * @param {string} playerId The id of the player.
 * @returns {Promise<number>} The number of games.
 */
async function addGame(playerId) {
    return (await statsCollection.findOneAndUpdate({playerId},
            {$inc: {games: 1}},
            {returnDocument: "after"})
    ).value.games;
}

/**
 * Add a win to the player's stats.
 * @param {string} playerId The id of the player.
 * @returns {Promise<number>} The number of wins.
 */
async function addLoss(playerId) {
    return (await statsCollection.findOneAndUpdate({playerId},
            {$inc: {losses: 1}},
            {returnDocument: "after"})
    ).value.losses;
}

/**
 * Add a win to the player's stats.
 * @param {string} playerId The id of the player.
 * @returns {Promise<number>} The number of wins.
 */
async function addWin(playerId) {
    return (await statsCollection.findOneAndUpdate({playerId},
            {$inc: {wins: 1}},
            {returnDocument: "after"})
    ).value.wins;
}

/**
 * Add a draw to the player's stats.
 * @param {string} playerId The id of the player.
 * @returns {Promise<number>} The number of draws.
 */
async function addDraw(playerId) {
    return (await statsCollection.findOneAndUpdate({playerId},
            {$inc: {draws: 1}},
            {returnDocument: "after"})
    ).value.draws;
}

module.exports = {addElo, getElo, updateElo, getAllElo, addLoss, addDraw, addWin, addGame};