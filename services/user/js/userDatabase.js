const {MongoClient} = require("mongodb");
const jwt = require("jsonwebtoken");

const uri = 'mongodb://mongodb:27017';
const client = new MongoClient(uri);
const database = client.db("Tron-the-successor");
const userCollection = database.collection("user");
const secretKey = "FC61BBB751F52278B9C49AD4294E9668E22B3B363BA18AE5DB1170216343A357";
const accessTokenDuration = "1h";
const refreshTokenDuration = "7d";

async function addUser(username, password) {
    const hashedPassword = password.hashCode();
    if (await userCollection.findOne({username})) {
        return {error: `User ${username} already exists`};
    }
    const refreshToken = jwt.sign({username}, secretKey, {expiresIn: refreshTokenDuration});
    const accessToken = jwt.sign({username}, secretKey, {expiresIn: "1h"});
    await userCollection.insertOne({username, password: hashedPassword, refreshToken, accessToken});
    return {username, refreshToken, accessToken};
}

async function getUser(username, password) {
    const user = await userCollection.findOne({username, password: password.hashCode()});
    if (user) {
        const accessToken = jwt.sign({username}, secretKey, {expiresIn: accessTokenDuration});
        const refreshToken = jwt.sign({username}, secretKey, {expiresIn: refreshTokenDuration});
        await userCollection.updateMany({username}, {$set: {refreshToken, accessToken}});
        return {username: user.username, accessToken, refreshToken};
    }
    return {error: "Wrong username or password"};
}

async function renewToken(refreshToken) {
    if (!refreshToken || !jwt.verify(refreshToken, secretKey)) {
        return {valid: false};
    }
    const user = await userCollection.findOne({refreshToken});
    if (!user) {
        return {valid: false};
    }
    const accessToken = jwt.sign({username: user.username}, secretKey, {expiresIn: accessTokenDuration});
    const newRefreshToken = jwt.sign({username: user.username}, secretKey, {expiresIn: refreshTokenDuration});
    await userCollection.updateMany({refreshToken}, {$set: {accessToken, refreshToken: newRefreshToken}});
    return {valid: true, accessToken, refreshToken: newRefreshToken};
}

String.prototype.hashCode = function () {
    let hash = 0;
    for (let i = 0; i < this.length; i++) {
        const chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
    }
    return hash;
};

module.exports = {addUser, getUser, renewToken};