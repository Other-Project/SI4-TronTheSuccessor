const {MongoClient} = require("mongodb");

const client = new MongoClient(process.env.MONGO_DB_URL ?? "mongodb://mongodb:27017");
const database = client.db("Tron-the-successor");
const chatCollection = database.collection("chat");

/**
 * Gets the chat messages
 * @param {string | string[] } roomId The id of the chat room
 * @param {string} from The timestamp from which to get the messages (optional)
 * @param {number} limit The number of messages to get (optional)
 * @param {number} order The order of the messages (optional)
 * @returns {Promise<{date: Date, author: string, type: string, content: string}[]>}
 */
exports.getChat = async function (roomId, from = undefined, limit = 25, order = 1) {
    let query;
    if (Array.isArray(roomId)) query = {roomId: roomId.sort()};
    else query = {roomId};
    if (from) query.timestamp = {$gt: from};
    const result = await chatCollection.find(query).sort({timestamp: order}).limit(limit).toArray();
    console.debug(result);
    return result;
};

/**
 * Stores a message sent in a chat room
 * @param {string} roomId The id of the chat room
 * @param {string} author The author of the message
 * @param {"text"|"friend-request"|"game-invitation"} type The type of the message
 * @param {string} content The content of the message
 * @returns {Promise<{date: Date, author: string, type: string, content: string}>} The stored message
 */
exports.storeMessage = async function (roomId, author, type, content) {
    const message = {roomId, author, type, content, date: new Date()};
    console.debug(message, await chatCollection.insertOne(message));
    return message;
};

/**
 * Verifies the validity of the message
 * @param {object} message The message to verify
 * @returns {boolean} True if the message is valid, false otherwise
 */
exports.verifyMessage = function (message) {
    if (!message.type || !message.content) return false;
    return ["text", "friend-request", "game-invitation"].includes(message.type);
};

/**
 * Gets all the users with whom the user has a chat
 * @param username The username of the user
 * @returns {Promise<string[]>} The list of usernames
 */
exports.getAllRoom = async function (username) {
    const friendsRoom = await chatCollection.aggregate([
        {
            $match: {
                roomId: {$in: [username]},
                $expr: {$eq: [{$size: "$roomId"}, 2]}
            }
        },
        {$unwind: "$roomId"},
        {
            $match: {
                roomId: {$ne: username}
            }
        },
        {
            $group: {
                _id: null,
                users: {$addToSet: "$roomId"}
            }
        },
        {
            $project: {
                _id: 0,
                users: 1
            }
        }
    ]).toArray();
    console.debug(friendsRoom);
    return friendsRoom.length > 0 ? friendsRoom[0].users : [];
};

/**
 * Gets the room id
 * @param username The username of the user
 * @param room The asked room
 * @return {string | string[]} The room id
 */
exports.getRoomId = function (username, room) {
    if (room === "global") return room;
    return [username, room].sort();
};
