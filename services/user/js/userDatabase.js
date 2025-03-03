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
const maxLength = 20;
const authorizedRegex = /^[a-zA-Z0-9]+$/;

async function addUser(username, password, securityQuestions) {
    const {error} = checkValue(username, password, securityQuestions);
    if (error)
        return {error};
    if (await userCollection.findOne({username}))
        return {error: `User ${username} already exists`};
    const hashedPassword = hash(password);
    const hashedSecurityQuestions = securityQuestions.map(q => ({
        question: q.question,
        answer: hash(q.answer)
    }));
    const {accessToken, refreshToken} = getTokens({username});
    await userCollection.insertOne({username, password: hashedPassword, securityQuestions: hashedSecurityQuestions});
    return {username, refreshToken, accessToken};
}

async function getUser(username, password) {
    const user = await userCollection.findOne({username, password: hash(password)});
    if (user) {
        const {accessToken, refreshToken} = getTokens(user);
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
    const {accessToken, refreshToken: newRefreshToken} = getTokens(user);
    await userCollection.updateMany({refreshToken}, {$set: {accessToken, refreshToken: newRefreshToken}});
    return {valid: true, accessToken, refreshToken: newRefreshToken};
}

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
        return {error: "Username and password must contain only letters and numbers"};
    if (!Array.isArray(securityQuestions) || securityQuestions.length !== 2)
        return {error: "Security questions must be an array of 2 elements"};
    for (const question of securityQuestions) {
        if (!question.question || !question.answer)
            return {error: "Question or answer is missing"};
        if (typeof question.question !== "string" || typeof question.answer !== "string")
            return {error: "Question and answer must be strings"};
        if (question.question === "" || question.answer === "")
            return {error: "Question and answer must not be empty"};
    }
    return {};
}

function getTokens(user) {
    return {
        accessToken: jwt.sign({username: user.username}, secretKey, {
            expiresIn: accessTokenDuration
        }),
        refreshToken: jwt.sign({username: user.username}, secretKey, {
            expiresIn: refreshTokenDuration
        })
    };
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