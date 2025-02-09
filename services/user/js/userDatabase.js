const {MongoClient} = require("mongodb");
let jwt = require("jsonwebtoken");

// Replace the uri string with your connection string.
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const database = client.db("Tron-the-successor");
const userCollection = database.collection("user");
const secretKey = "FC61BBB751F52278B9C49AD4294E9668E22B3B363BA18AE5DB1170216343A357"


async function addUser(username, password) {
    //TODO : hash password
    if (await userCollection.findOne({username: username})) {
        return {error: "User " + username + " already exists"};
    }
    let permanentToken = jwt.sign({username: username}, secretKey);
    let sessionToken = jwt.sign({username: username}, secretKey, {expiresIn: "1h"});
    await userCollection.insertOne({
        username: username,
        password: password,
        permanentToken: permanentToken,
        sessionToken: sessionToken
    });
    return {username: username, permanentToken: permanentToken, sessionToken: sessionToken};
}

async function getUser(username, password) {
    let user = await userCollection.findOne({username: username, password: password});
    if (user) {
        let sessionToken = jwt.sign({username: username}, secretKey, {expiresIn: "1h"});
        await userCollection.updateOne(user, {$set: {sessionToken: sessionToken}});
        return {
            username: user.username,
            sessionToken: sessionToken
        };
    } else {
        return {error: "Wrong username or password"};
    }
}

async function checkToken(sessionToken) {
    try {
        if (!sessionToken) {
            return false;
        }
        const decoded = jwt.verify(sessionToken, secretKey);
        if (!decoded) {
            return false;
        }
        let user = await userCollection.findOne({username: decoded.username});
        return user && user.sessionToken === sessionToken;
    } catch (error) {
        return false;
    }
}

if (typeof exports !== "undefined") { // CommonJS
    exports.addUser = addUser;
    exports.getUser = getUser;
    exports.checkToken = checkToken;
}
