const {MongoClient} = require("mongodb");

const client = new MongoClient(process.env.MONGO_DB_URL ?? 'mongodb://mongodb:27017');
const database = client.db("Tron-the-successor");
const statsCollection = database.collection("stats");
const eloToRank = {
    0: {rank: "Line III", baseRank: "Line"},
    100: {rank: "Line II", baseRank: "Line"},
    200: {rank: "Line I", baseRank: "Line"},
    300: {rank: "Triangle III", baseRank: "Triangle"},
    400: {rank: "Triangle II", baseRank: "Triangle"},
    500: {rank: "Triangle I", baseRank: "Triangle"},
    600: {rank: "Square III", baseRank: "Square"},
    700: {rank: "Square II", baseRank: "Square"},
    800: {rank: "Square I", baseRank: "Square"},
    900: {rank: "Pentagon III", baseRank: "Pentagon"},
    1000: {rank: "Pentagon II", baseRank: "Pentagon"},
    1100: {rank: "Pentagon I", baseRank: "Pentagon"},
    1200: {rank: "Hexagon", baseRank: "Hexagon"},
};
const rankOrder = [
    "Line III", "Line II", "Line I",
    "Triangle III", "Triangle II", "Triangle I",
    "Square III", "Square II", "Square I",
    "Pentagon III", "Pentagon II", "Pentagon I",
    "Hexagon"
];
exports.BASE_ELO = 300;

/**
 * Get the ELO of a player.
 * @param {string} playerId
 * @returns {Promise<number|null>}
 */
exports.getElo = async function (playerId) {
    const elo = await statsCollection.findOne({playerId});
    return elo?.elo ?? null;
};

/**
 * Update the ELO of a player.
 * @param playerId
 * @param newElo
 * @returns {Promise<number>}
 */
exports.updateElo = async function (playerId, newElo) {
    await statsCollection.updateOne(
        {playerId},
        {$set: {elo: newElo}},
        {upsert: true}
    );
    return newElo;
};

/**
 * Get all ELOs.
 * @returns {Promise<[]>}
 */
exports.getAllElo = async function () {
    return await statsCollection.find({}).toArray();
};

/**
 * Add a game to a Player
 * @param {string} playerId The id of the player.
 * @param {number} timePlayed The time of the game.
 * @returns {Promise<number>}
 */
exports.addGame = async function (playerId, timePlayed) {
    await statsCollection.updateOne(
        {playerId},
        {$inc: {games: 1, timePlayed: timePlayed}},
        {upsert: true}
    );
};

/**
 * Add a draw to the player's stats.
 * @param {string} playerId id of the player.
 * @param {string} otherPlayerId The id of the other player.
 * @returns {Promise<void>}
 */
exports.addDraw = async function (playerId, otherPlayerId) {
    await statsCollection.bulkWrite([
        {
            updateOne: {
                filter: {playerId},
                update: {$inc: {draws: 1}},
                upsert: true
            }
        },
        {
            updateOne: {
                filter: {playerId: otherPlayerId},
                update: {$inc: {draws: 1}},
                upsert: true
            }
        }
    ]);
};

/**
 * Add a win for the first player and a loss for the second player and update their win streaks.
 * @param playerId The id of the player.
 * @param otherPlayerId The id of the other player.
 * @returns {Promise<void>}
 */
exports.addWinAndLoss = async function (playerId, otherPlayerId) {
    await statsCollection.bulkWrite([
        {
            updateOne: {
                filter: {playerId},
                update: {$inc: {wins: 1, winStreak: 1}},
                upsert: true
            }
        },
        {
            updateOne: {
                filter: {playerId: otherPlayerId},
                update: {$inc: {losses: 1}, $set: {winStreak: 0}},
                upsert: true
            }
        }
    ]);
};

/**
 * Get the usernames of the top players.
 * @param limit The number of players to get.
 * @returns {Promise<{playerId: string, winrate: number, rank: string}[]>} The usernames of the top players.
 */
getTopPlayers = async function (limit = 10) {
    const topPlayers = await statsCollection.find({}, {
        projection: {
            playerId: 1,
            wins: 1,
            losses: 1,
            elo: 1,
            _id: 0
        }
    }).sort({elo: -1}).limit(limit).toArray();

    return topPlayers.map(player => {
        const totalGames = player.wins + player.losses;
        const winrate = totalGames > 0 ? (player.wins / totalGames) * 100 : 0;
        const {rank} = getRank(player.elo);
        return {
            playerId: player.playerId,
            winrate: winrate,
            rank: rank
        };
    });
};

/**
 * Get the number of players in each rank.
 * @returns {Promise<{string : number}>}
 */
rankRepartition = async function () {
    const repartition = {};
    for (let rank of rankOrder) {
        const eloThreshold = Object.keys(eloToRank).find(key => eloToRank[key].rank === rank);
        repartition[rank] = await statsCollection.countDocuments({elo: {$gte: parseInt(eloThreshold)}});
    }
    return repartition;
};

/**
 * Calculate the rank of a player based on their ELO.
 * @param elo The ELO of the player.
 * @returns {*&{eloInRank: number}}
 */
function getRank(elo) {
    for (let rankElo of Object.keys(eloToRank).reverse())
        if (elo >= rankElo)
            return {...eloToRank[rankElo], eloInRank: elo - rankElo};
    return {...eloToRank[exports.BASE_ELO], eloInRank: elo}; // Default to "Triangle III"
}

/**
 * Get all stats of a player.
 * @param playerId
 * @returns {Promise<{wins: number, losses: number, draws: number, games: number, winStreak: number, rank: string, eloInRank: number, timePlayed: number}>}
 */
exports.getAllStats = async function (playerId) {
    const stats = await statsCollection.findOne({playerId}) ?? {};

    const updatedStats = {
        wins: stats.wins ?? 0,
        losses: stats.losses ?? 0,
        draws: stats.draws ?? 0,
        games: stats.games ?? 0,
        winStreak: stats.winStreak ?? 0,
        timePlayed: stats.timePlayed ?? 0,
        elo: stats.elo ?? exports.BASE_ELO
    };

    await statsCollection.updateOne(
        {playerId},
        {$set: updatedStats}
    );

    const {rank, eloInRank, baseRank} = getRank(updatedStats.elo);
    const topPlayers = await getTopPlayers(10);
    const rankDistribution = await rankRepartition();

    console.log(await statsCollection.find({}));

    return {...updatedStats, rank, eloInRank, baseRank, topPlayers, rankDistribution};
};
