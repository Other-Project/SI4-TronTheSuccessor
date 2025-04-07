const {MongoClient} = require("mongodb");
const jwt = require("jsonwebtoken");
const {createHash} = require("node:crypto");
const {sendResponse, getUser} = require("./utils.js");

// MongoDB
const client = new MongoClient(process.env.MONGO_DB_URL ?? 'mongodb://mongodb:27017');
const database = client.db("Tron-the-successor");
const userCollection = database.collection("user");
const inventoryCollection = database.collection("inventory");

// JWT
const secretKey = process.env.JWT_SECRET;
if (!secretKey) throw new Error("JWT_SECRET is not set");
const accessTokenDuration = process.env.JWT_ACCESS_TOKEN_EXPIRES_IN ?? "1h";
const refreshTokenDuration = process.env.JWT_REFRESH_TOKEN_EXPIRES_IN ?? "7d";
const resetPasswordTokenDuration = process.env.JWT_RESET_PASSWORD_TOKEN_EXPIRES_IN ?? "10min";

// Constants
const usernameMinLength = 3;
const passwordMinLength = 6;
const maxLength = 20;
const authorizedRegex = /^[A-Za-z0-9#?!@$%^&*]+$/;
const securityQuestionsArray = [
    "What was the name of your favorite teacher in elementary school ?",
    "What was your dream job as a child ?",
    "In what city or town did you meet your spouse/partner ?",
    "What was your favorite vacation spot as a child ?",
    "What is the name of the first book you ever read ?",
    "What was the first concert you ever attended ?",
    "What was the name of your first stuffed animal ?",
    "What was your favorite subject in high school ?",
    "What was the model of your family's first television set ?",
    "What is the name of the street where your best friend lived during childhood ?",
    "What is the first name of the person you went to your first dance with ?",
    "What is the name of the place where you had your first kiss ?",
    "What is the title of your favorite childhood book ?",
    "What is the name of the first beach you visited ?",
    "What was the first movie you saw in a theater ?",
    "What is the name of the first foreign country you visited ?",
    "What was the name of your favorite childhood cartoon character ?"
];

/**
 * Register a new user
 * @param {string} username The username
 * @param {string} password The password
 * @param {{question: string, answer: string}[2]} securityQuestions The security questions
 * @returns {Promise<{error: string}|{username: string, accessToken: string, refreshToken: string}>}
 */
exports.addUser = async function (username, password, securityQuestions) {
    const error = checkValue(username, password, securityQuestions);
    if (error) return error;
    if (await userCollection.findOne({username}))
        return {error: `User ${username} already exists`};
    const hashedSecurityQuestions = securityQuestions.map(q => ({
        question: q.question,
        answer: hash(q.answer)
    }));
    const user = {username, password: hash(password), securityQuestions: hashedSecurityQuestions};
    await userCollection.insertOne(user);
    const {accessToken, refreshToken} = getJwt(user);
    return {username, refreshToken, accessToken};
};

/**
 * Login a user
 * @param username The username
 * @param password The password
 * @returns {Promise<{error: string}|{accessToken: (*), refreshToken: (*)}>}
 */
exports.loginUser = async function loginUser(username, password) {
    const user = await userCollection.findOne({username, password: hash(password)});
    if (!user) return {error: "Wrong username or password"};
    const {accessToken, refreshToken} = getJwt(user);
    return {username, refreshToken, accessToken};
};

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
 * @returns {Promise<boolean>} If the friend could be added
 */
exports.addFriend = async function (playerId, otherId) {
    const user = await userCollection.findOne({username: otherId, pendingFriendRequests: {$in: [playerId]}});
    if (!user) return false;
    await userCollection.updateOne(
        {username: playerId},
        {
            $addToSet: {friends: otherId},
        },
        {upsert: true}
    );
    await userCollection.updateOne(
        {username: otherId},
        {
            $addToSet: {friends: playerId},
            $pull: {pendingFriendRequests: playerId}
        },
        {upsert: true}
    );
    return true;
};

/**
 * Add a friend to a player's pending friend requests
 * @param username The username of the player
 * @param friend The username of the friend
 * @returns {Promise<boolean>} Returns if the friend request could be added
 */
exports.addToPendingFriendRequests = async function (username, friend) {
    const user = await userCollection.findOne({
        $or: [
            {username: username, pendingFriendRequests: friend},
            {username: friend, pendingFriendRequests: username},
            {username: username, friends: friend}
        ]
    });
    if (user) return false;
    await userCollection.updateOne(
        {username: username},
        {$addToSet: {pendingFriendRequests: friend}},
        {upsert: true}
    );
    return true;
};

/**
 * Get the friends of a player
 * @param {string} playerId The id of the player
 * @returns {Promise<string[]>}
 */
exports.getFriends = async function (playerId) {
    const user = await userCollection.findOne({username: playerId});
    return user ? user.friends : [];
};

/**
 * Get the pending friend requests of a player
 * @param playerId The id of the player
 * @returns {Promise<string[]>} The pending friend requests
 */
exports.getPendingFriendRequests = async function (playerId) {
    const user = await userCollection.findOne({username: playerId});
    return user ? user.pendingFriendRequests : [];
};

/**
 * Get the pending friend requests for a user
 * @param username The username of the user
 * @returns {Promise<string[]>} The username of the users who sent a friend request
 */
exports.getPendingFriendRequestsForUser = async function (username) {
    return await userCollection.distinct("username", {pendingFriendRequests: username});
};

/**
 * Remove a friend from a player
 * @param {string} playerId The id of the player
 * @param {string} otherId The id of the friend to remove
 * @returns {Promise<boolean>} If the friend could be removed
 */
exports.removeFriend = async function (playerId, otherId) {
    const user = await userCollection.findOne({username: playerId, friends: otherId});
    const friend = await userCollection.findOne({username: otherId, friends: playerId});
    if (!user || !friend) return false;
    await userCollection.updateOne(
        {username: playerId},
        {$pull: {friends: otherId}}
    );
    await userCollection.updateOne(
        {username: otherId},
        {$pull: {friends: playerId}}
    );
    return true;
};

exports.renewToken = async function (refreshToken) {
    if (!refreshToken)
        return {error: "Refresh token is missing"};
    const username = getUser(refreshToken)?.username;
    if (!username) return {error: "Refresh token is invalid : " + refreshToken};
    const user = await userCollection.findOne({username});
    if (!user)
        return {error: "Could not find user with this refresh token : " + refreshToken};
    return getJwt(user);
};

exports.getSecurityQuestions = async function (username) {
    if (username) {
        const user = await userCollection.findOne({username});
        if (!user)
            return {error: "Could not find user with this username : " + username};
        return user.securityQuestions.map(question => ({question: question.question}));
    }
    return getSecurityQuestionsFromArray();
};

exports.verifyAnswers = async function (username, answers) {
    if (!username || !answers || !Array.isArray(answers) || answers.length !== 2)
        return {error: "Username or answers are missing"};
    const user = await userCollection.findOne({username});
    if (!user)
        return {error: "Could not find user with this username : " + username};
    const hashedAnswers = answers.map(hash);
    if (!user.securityQuestions.every((question, i) => question.answer === hashedAnswers[i]))
        return {error: "Wrong answers"};
    const userInfo = {username: user.username};
    const resetPasswordToken = jwt.sign(userInfo, secretKey, {expiresIn: resetPasswordTokenDuration});
    return {resetPasswordToken};
};

exports.resetPassword = async function (newPassword, resetPasswordToken) {
    if (!newPassword)
        return {error: "New password is missing"};
    if (typeof newPassword !== "string" || newPassword.length < passwordMinLength || newPassword.length > maxLength)
        return {error: `New password must be at least ${passwordMinLength} and at most ${maxLength} characters long`};
    if (!authorizedRegex.test(newPassword))
        return {error: "New password must contain only letters, numbers or one of the following characters : #?!@$%^&*"};

    const username = getUser(resetPasswordToken)?.username;
    if (!username) return {error: "It took too long to reset your password, please try again"};
    const user = await userCollection.findOne({username});
    if (!user)
        return {error: "Could not find user with this reset password token : " + resetPasswordToken};
    await userCollection.updateOne({username}, {$set: {password: hash(newPassword)}});
    const {accessToken, refreshToken} = getJwt(user);
    return {message: "Password successfully reset", accessToken, refreshToken};
};

exports.removePendingFriendRequests = async function (username, friends) {
    const user = await userCollection.findOne({username: username, pendingFriendRequests: friends});
    if (!user) return null;
    await userCollection.updateOne(
        {username: username},
        {$pull: {pendingFriendRequests: friends}}
    );

    return friends;
};

function getJwt(user) {
    const userInfo = {username: user.username};
    const accessToken = jwt.sign(userInfo, secretKey, {expiresIn: accessTokenDuration});
    const refreshToken = jwt.sign(userInfo, secretKey, {expiresIn: refreshTokenDuration});
    return {accessToken, refreshToken};
}

function getSecurityQuestionsFromArray() {
    return securityQuestionsArray.slice();
}

/**
 * Check if the given values are valid
 * @param {string} username The username
 * @param {string} password The password
 * @param {{question: string, answer: string}[2]} securityQuestions The security questions
 * @returns {{error: string}|null} The error message if the values are invalid, null otherwise
 */
function checkValue(username, password, securityQuestions) {
    if (!username || !password)
        return {error: "Username or password is missing"};
    if (typeof username !== "string" || typeof password !== "string")
        return {error: "Username and password must be strings"};
    if (username.length < usernameMinLength || password.length < passwordMinLength)
        return {error: `Username and password must be at least ${usernameMinLength} and ${passwordMinLength} characters long`};
    if (username.length > maxLength || password.length > maxLength)
        return {error: "Username and password must be at most 20 characters long"};
    if (!authorizedRegex.test(username) || !authorizedRegex.test(password))
        return {error: "Username and password must contain only letters, numbers or one of the following characters : #?!@$%^&*"};
    if (!Array.isArray(securityQuestions) || securityQuestions.length !== 2)
        return {error: "Security questions must be an array of 2 elements"};
    if (securityQuestions.length !== new Set(securityQuestions).size)
        return {error: "The security questions must be different"};
    for (const question of securityQuestions) {
        if (!question.question || !question.answer)
            return {error: "Question or answer is missing"};
        if (question.question === "" || question.answer === "")
            return {error: "Question and answer must not be empty"};
        if (!securityQuestionsArray.includes(question.question))
            return {error: "The question " + question.question + " is not a valid security question"};
    }
    return null;
}

function hash(str) {
    const hash = createHash("sha256");
    hash.update(str);
    return hash.digest("hex");
}

exports.handleGetAvatar = async function (request, response, username) {
    const inventory = await inventoryCollection.findOne({username: username}, {projection: {"avatars.selected": 1}});
    const avatar = inventory?.avatars?.selected ?? "mike";
    response.setHeader('Location', `/assets/avatars/${avatar}.svg`);
    sendResponse(response, 302);
}
