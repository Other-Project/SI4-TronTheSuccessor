const {MongoClient} = require("mongodb");

const client = new MongoClient(process.env.MONGO_DB_URL ?? 'mongodb://mongodb:27017');
const database = client.db("Tron-the-successor");
const chatCollection = database.collection("chat");

/**
 * Gets the chat messages
 * @param {string} roomId The id of the chat room
 * @param {string} from The timestamp from which to get the messages (optional)
 * @param {number} limit The number of messages to get (optional)
 * @returns {Promise<{date: string, author: string, type: string, content: string}[]>}
 */
exports.getChat = async function (roomId, from = undefined, limit = 25) {
    let query = {roomId};
    if (from) query.timestamp = {$gt: from};
    return await chatCollection.find(query).sort({timestamp: 1}).limit(limit).toArray();
}


/**
 * Stores a message sent in a chat room
 * @param {string} roomId The id of the chat room
 * @param {string} author The author of the message
 * @param {"text"|"friend-request"|"game-invitation"} type The type of the message
 * @param {string} content The content of the message
 * @returns {Promise}
 */
exports.storeMessage = async function (roomId, author, type, content) {
    await chatCollection.insertOne({roomId, author, type, content, date: new Date()});
}
