const {MongoClient} = require("mongodb");
const jwt = require("jsonwebtoken");

const uri = 'mongodb://mongodb:27017';
const client = new MongoClient(uri);
const database = client.db("Tron-the-successor");
const userCollection = database.collection("user");
const secretKey = "FC61BBB751F52278B9C49AD4294E9668E22B3B363BA18AE5DB1170216343A357";

async function addUser(username, password) {
    const hashedPassword = password.hashCode();
    if (await userCollection.findOne({username})) {
        return {error: `User ${username} already exists`};
    }
    const permanentToken = jwt.sign({username}, secretKey);
    const sessionToken = jwt.sign({username}, secretKey, {expiresIn: "1h"});
    await userCollection.insertOne({username, password: hashedPassword, permanentToken, sessionToken});
    return {username, permanentToken, sessionToken};
}

async function getUser(username, password) {
    const user = await userCollection.findOne({username, password: password.hashCode()});
    if (user) {
        const sessionToken = jwt.sign({username}, secretKey, {expiresIn: "1h"});
        await userCollection.updateOne({username}, {$set: {sessionToken}});
        return {username: user.username, sessionToken};
    }
    return {error: "Wrong username or password"};
}

async function checkToken(sessionToken) {
    try {
        if (!sessionToken) return false;
        const decoded = jwt.verify(sessionToken, secretKey);
        const user = await userCollection.findOne({username: decoded.username});
        return user && user.sessionToken === sessionToken;
    } catch (error) {
        return false;
    }
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

module.exports = {addUser, getUser, checkToken};