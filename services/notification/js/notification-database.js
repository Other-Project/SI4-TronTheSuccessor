const {MongoClient} = require("mongodb");
const client = new MongoClient(process.env.MONGO_DB_URL ?? "mongodb://mongodb:27017");
const database = client.db("Tron-the-successor");
const notificationCollection = database.collection("notification");

/**
 * Store a notification.
 * @param {string} playerId The id of the player who received the notification.
 * @param {string} otherPlayerId The id of the other player who sent the notification.
 */
exports.addNotification = async function (playerId, otherPlayerId) {
    await notificationCollection.insertOne({
        playerId: playerId,
        fromPlayer: otherPlayerId
    });
};

/**
 * Get all unique players who sent notifications to a specific player.
 * @param {string} playerId The id of the player who received notifications.
 * @returns {Promise<string[]>} Promise resolving to an array of player IDs who sent notifications.
 */
exports.getUniqueNotificationSenders = async function (playerId) {
    return await notificationCollection.distinct("fromPlayer", {
        playerId: playerId
    });
};

/**
 * Remove a notification.
 * @param {string} playerId The id of the player who received the notification.
 * @param {string} otherPlayerId The id of the other player who sent the notification.
 */
exports.removeNotification = async function (playerId, otherPlayerId) {
    await notificationCollection.deleteOne({
        playerId: playerId,
        fromPlayer: otherPlayerId
    });
};

/**
 * Register a notification token for a player.
 * @param playerId The username of the player.
 * @param token The notification token.
 * @param device The device of the player.
 * @returns {Promise<void>} Promise resolving when the token is registered.
 */
exports.registerNotificationToken = async function (playerId, token, device) {
    await notificationCollection.updateOne(
        {playerId: playerId},
        {
            $set: {
                "devices": {
                    [device]: token
                }
            }
        },
        {upsert: true}
    );
};

/**
 * Get the notification token for a player.
 * @param playerId The username of the player.
 * @returns {Promise<string[]>} Promise resolving to an array of notification tokens.
 */
exports.getNotificationToken = async function (playerId) {
    const data = await notificationCollection.findOne({playerId: playerId});
    return Object.values(data?.devices) ?? null;
};
