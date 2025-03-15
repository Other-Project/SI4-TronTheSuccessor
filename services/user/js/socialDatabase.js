const {MongoClient} = require("mongodb");

const client = new MongoClient(process.env.MONGO_DB_URL ?? "mongodb://mongodb:27017");
const database = client.db("Tron-the-successor");
const socialCollection = database.collection("social");

/**
 * Add a friend to a user
 * @param {string} playerId The id of the player
 * @param {string} otherId The id of the friend to add
 * @returns {Promise<void>}
 */
async function addFriend(playerId, otherId) {
    socialCollection.addOne({playerId, otherId});
}

/**
 * Get the friends of a player
 * @param {string} playerId The id of the player
 * @returns {Promise<string[]>}
 */
async function getFriends(playerId) {
    return socialCollection.find({playerId}).toArray();
}

/**
 * Remove a friend from a player
 * @param {string} playerId The id of the player
 * @param {string} otherId The id of the friend to remove
 * @returns {Promise<void>}
 */
async function removeFriend(playerId, otherId) {
    return socialCollection.deleteOne({playerId, otherId});
}
