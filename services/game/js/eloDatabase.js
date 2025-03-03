const {MongoClient} = require("mongodb");

const client = new MongoClient(process.env.MONGO_DB_URL ?? 'mongodb://mongodb:27017');
const database = client.db("Tron-the-successor");
const eloCollection = database.collection("elo");

/**
 * Add a new ELO to the database.
 * @param {string} playerId
 * @param {number} elo
 * @returns {Promise<{error: string}|*>}
 */
async function addElo(playerId, elo) {
    const existingElo = await eloCollection.findOne({playerId});
    if (existingElo) return {error: `ELO for player ${playerId} already exists`};
    await eloCollection.insertOne({playerId, elo});
    return elo;
}

/**
 * Get the ELO of a player.
 * @param {string} playerId
 * @returns {Promise<number|*|{error: string}>}
 */
async function getElo(playerId) {
    const elo = await eloCollection.findOne({playerId});
    if (elo) return elo.elo;
    return {error: `ELO for player ${playerId} not found`};
}

/**
 * Update the ELO of a player.
 * @param playerId
 * @param newElo
 * @returns {Promise<number|*>}
 */
async function updateElo(playerId, newElo) {
    await eloCollection.updateOne(
        {playerId},
        {$set: {elo: newElo}},
        {upsert: true}
    );
    return newElo;
}

module.exports = {addElo, getElo, updateElo};