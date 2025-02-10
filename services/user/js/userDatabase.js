const {MongoClient} = require("mongodb");
const jwt = require("jsonwebtoken");

const client = new MongoClient(process.env.MONGO_DB_URL ?? 'mongodb://mongodb:27017');
const database = client.db("Tron-the-successor");
const userCollection = database.collection("user");
const secretKey = "FC61BBB751F52278B9C49AD4294E9668E22B3B363BA18AE5DB1170216343A357";
const accessTokenDuration = "1h";
const refreshTokenDuration = "7d";
const usernameMinLength = 3;
const passwordMinLength = 6;

async function addUser(username, password) {
    const {error} = checkValue(username, password);
    if (error)
        return {error};
    const hashedPassword = hash(password);
    if (await userCollection.findOne({username}))
        return {error: `User ${username} already exists`};
    const refreshToken = jwt.sign({username}, secretKey, {expiresIn: refreshTokenDuration});
    const accessToken = jwt.sign({username}, secretKey, {expiresIn: "1h"});
    await userCollection.insertOne({username, password: hashedPassword, refreshToken, accessToken});
    return {username, refreshToken, accessToken};
}

async function getUser(username, password) {
    const user = await userCollection.findOne({username, password: hash(password)});
    if (user) {
        const accessToken = jwt.sign({username}, secretKey, {expiresIn: accessTokenDuration});
        const refreshToken = jwt.sign({username}, secretKey, {expiresIn: refreshTokenDuration});
        await userCollection.updateMany({username}, {$set: {refreshToken, accessToken}});
        return {username: user.username, accessToken, refreshToken};
    }
    return {error: "Wrong username or password"};
}

async function renewToken(refreshToken) {
    if (!refreshToken)
        return {valid: false, error: "Refresh token is missing"};
    if (!jwt.verify(refreshToken, secretKey))
        return {valid: false, error: "Refresh token is invalid : " + refreshToken};
    const user = await userCollection.findOne({refreshToken});
    if (!user)
        return {valid: false, error: "Could not find user with this refresh token : " + refreshToken};
    const accessToken = jwt.sign({username: user.username}, secretKey, {expiresIn: accessTokenDuration});
    const newRefreshToken = jwt.sign({username: user.username}, secretKey, {expiresIn: refreshTokenDuration});
    await userCollection.updateMany({refreshToken}, {$set: {accessToken, refreshToken: newRefreshToken}});
    return {valid: true, accessToken, refreshToken: newRefreshToken};
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
    return {};
}

function hash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
    }
    return hash;
}

module.exports = {addUser, getUser, renewToken};