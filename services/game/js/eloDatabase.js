const {MongoClient} = require("mongodb");

const client = new MongoClient(process.env.MONGO_DB_URL ?? 'mongodb://mongodb:27017');
const database = client.db("Tron-the-successor");
const statsCollection = database.collection("stats");
const eloToRank = {
    0: "Line III",
    100: "Line II",
    200: "Line I",
    300: "Triangle III",
    400: "Triangle II",
    500: "Triangle I",
    600: "Square III",
    700: "Square II",
    800: "Square I",
    900: "Pentagon III",
    1000: "Pentagon II",
    1100: "Pentagon I",
    1200: "Hexagon",
};

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
            {returnDocument: "after", upsert: true})
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
            {returnDocument: "after", upsert: true})
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
            {returnDocument: "after", upsert: true})
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
            {returnDocument: "after", upsert: true})
    ).value.draws;
}

/**
 * Add a win streak to the player's stats.
 * @param playerId
 * @returns {Promise<number|*>}
 */
async function addWinStreak(playerId) {
    return (await statsCollection.findOneAndUpdate({playerId},
            {$inc: {winStreak: 1}},
            {returnDocument: "after", upsert: true})
    ).value.winStreak;
}

/**
 * Reset the win streak of the player.
 * @param playerId
 * @returns {Promise<number|*>}
 */
async function resetWinStreak(playerId) {
    return (await statsCollection.findOneAndUpdate({playerId},
            {$set: {winStreak: 0}},
            {returnDocument: "after", upsert: true})
    ).value.winStreak;
}

/**
 * Calculate the rank of a player based on their ELO.
 * @param elo The ELO of the player.
 * @returns {{rank: string, eloInRank: number}} The rank of the player and the ELO in that rank.
 */
function getRank(elo) {
    for (let rankElo of Object.keys(eloToRank).reverse())
        if (elo >= rankElo) return {rank: eloToRank[rankElo], eloInRank: elo - rankElo};
}

/**
 * Update the play time of a player.
 * @param playerId
 * @param time
 * @returns {Promise<void>}
 */
async function updatePlayTime(playerId, time) {
    await statsCollection.updateOne(
        {playerId},
        {$inc: {timePlayed: time}},
        {upsert: true}
    );
}

/**
 * Get all stats of a player.
 * @param playerId
 * @returns {Promise<{wins: number, losses: number, draws: number, games: number, winStreak: number, rank: string, eloInRank: number, timePlayed: number}>}
 */
async function getAllStats(playerId) {
    const stats = await statsCollection.findOne({playerId});
    if (!stats) return {
        wins: 0,
        losses: 0,
        draws: 0,
        games: 0,
        winStreak: 0,
        rank: "Triangle III",
        eloInRank: 0,
        timePlayed: 0
    };
    const {wins, losses, draws, games, winStreak, timePlayed} = stats;
    const {rank, eloInRank} = getRank(stats.elo);
    return {wins, losses, draws, games, winStreak, rank, eloInRank, timePlayed};

}

module.exports = {
    addElo,
    getElo,
    updateElo,
    addLoss,
    addDraw,
    addWin,
    addGame,
    addWinStreak,
    resetWinStreak,
    updatePlayTime,
    getAllStats
};
