const {MongoClient} = require("mongodb");
const jwt = require("jsonwebtoken");
const {createHash} = require('node:crypto');

const client = new MongoClient(process.env.MONGO_DB_URL ?? 'mongodb://mongodb:27017');
const database = client.db("Tron-the-successor");
const userCollection = database.collection("user");
const secretKey = "FC61BBB751F52278B9C49AD4294E9668E22B3B363BA18AE5DB1170216343A357";
const accessTokenDuration = "1h";
const refreshTokenDuration = "7d";
const usernameMinLength = 3;
const passwordMinLength = 6;

/**
 * Register a new user
 * @param username The username
 * @param password The password
 * @returns {Promise<{error: string}|{accessToken: (*), refreshToken: (*)}|{error: string}|{error: string}|{error: string}|{error: string}|{error: string}>}
 */
exports.addUser = async function (username, password) {
    const error = checkValue(username, password);
    if (error) return error;
    if (await userCollection.findOne({username}))
        return {error: `User ${username} already exists`};
    const user = {username, password: hash(password)};
    await userCollection.insertOne(user);
    return getJwt(user);
}

/**
 * Login a user
 * @param username The username
 * @param password The password
 * @returns {Promise<{error: string}|{accessToken: (*), refreshToken: (*)}>}
 */
exports.loginUser = async function loginUser(username, password) {
    const user = await userCollection.findOne({username, password: hash(password)});
    if (!user) return {error: "Wrong username or password"};
    return getJwt(user);
}

/**
 * Get a user by username
 * @param username The username
 * @returns {Promise<Document>}
 */
exports.getUser = async function (username) {
    return await userCollection.findOne({username: username});
};

/**
 * Add a friend to a player
 * @param playerId The id of the player
 * @param otherId The id of the friend to add
 * @returns {Promise<null|void>} If the friend could not be added
 */
exports.addFriend = async function (playerId, otherId) {
    const user = await userCollection.findOne({username: playerId, pendingFriendRequests: otherId});
    if (!user) return null;
    await userCollection.updateOne(
        {username: playerId},
        {
            $addToSet: {friends: otherId},
            $pull: {pendingFriendRequests: otherId}
        },
        {upsert: true}
    );
};

/**
 * Add a friend to a player's pending friend requests
 * @param username The username of the player
 * @param friend The username of the friend
 * @returns {Promise<string|void>} Returns the user if the friend request already exists
 */
exports.addToPendingFriendRequests = async function (username, friend) {
    const user = await userCollection.findOne({
        $or: [
            {username: username, pendingFriendRequests: friend},
            {username: friend, pendingFriendRequests: username}
        ]
    });
    if (user) return user.username;
    await userCollection.updateOne(
        {username: username},
        {$addToSet: {pendingFriendRequests: friend}},
        {upsert: true}
    );
};

/**
 * Get the friends of a player
 * @param {string} playerId The id of the player
 * @returns {Promise<string[]>}
 */
exports.getFriends = async function (playerId) {
    const user = await userCollection.findOne({username: playerId});
    return user ? user.friends : [];
}

/**
 * Remove a friend from a player
 * @param {string} playerId The id of the player
 * @param {string} otherId The id of the friend to remove
 * @returns {Promise<void>}
 */
exports.removeFriend = async function (playerId, otherId) {
    await userCollection.updateOne(
        {username: playerId},
        {$pull: {friends: otherId}}
    );
}

exports.renewToken = async function (refreshToken) {
    if (!refreshToken)
        return {error: "Refresh token is missing"};
    if (!jwt.verify(refreshToken, secretKey))
        return {error: "Refresh token is invalid : " + refreshToken};

    const username = jwt.decode(refreshToken).username;
    const user = await userCollection.findOne({username});
    if (!user)
        return {error: "Could not find user with this refresh token : " + refreshToken};

    return getJwt(user);
}

function getJwt(user) {
    const userInfo = {username: user.username};
    const accessToken = jwt.sign(userInfo, secretKey, {expiresIn: accessTokenDuration});
    const refreshToken = jwt.sign(userInfo, secretKey, {expiresIn: refreshTokenDuration});
    return {accessToken, refreshToken};
}

function checkValue(username, password) {
    if (!username || !password)
        return {error: "Username or password is missing"};
    if (typeof username !== "string" || typeof password !== "string")
        return {error: "Username and password must be strings"};
    if (username.length < usernameMinLength || password.length < passwordMinLength)
        return {error: `Username and password must be at least ${usernameMinLength} and ${passwordMinLength} characters long`};
    if (username.length > 20 || password.length > 20)
        return {error: "Username and password must be at most 20 characters long"};
    const regex = /^[a-zA-Z0-9]+$/;
    if (!regex.test(username) || !regex.test(password))
        return {error: "Username and password must contain only letters and numbers"};
    return null;
}

function hash(str) {
    const hash = createHash('sha256');
    hash.update(str);
    return hash.digest('hex');
}
