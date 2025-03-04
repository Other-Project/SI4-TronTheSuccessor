const {MongoClient} = require("mongodb");
const jwt = require("jsonwebtoken");
const {createHash} = require("node:crypto");

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

const securityQuestions = ["What was the name of your favorite teacher in elementary school?",
    "What was your dream job as a child?",
    "In what city or town did you meet your spouse/partner?",
    "What was your favorite vacation spot as a child?",
    "What is the name of the first book you ever read?",
    "What was the first concert you ever attended?",
    "What was the name of your first stuffed animal?",
    "What was your favorite subject in high school?",
    "What was the model of your family's first television set?",
    "What is the name of the street where your best friend lived during childhood?",
    "What is the first name of the person you went to your first dance with?",
    "What is the name of the place where you had your first kiss?",
    "What is the title of your favorite childhood book?",
    "What is the name of the first beach you visited?",
    "What was the first movie you saw in a theater?",
    "What is the name of the first foreign country you visited?",
    "What was the name of your favorite childhood cartoon character?"];

async function addUser(username, password, securityQuestions) {
    const error = checkValue(username, password, securityQuestions);
    if (error) return error;
    if (await userCollection.findOne({username}))
        return {error: `User ${username} already exists`};
    const hashedPassword = hash(password);
    const hashedSecurityQuestions = securityQuestions.map(q => ({
        question: q.question,
        answer: hash(q.answer)
    }));
    const user = {username, password: hashedPassword, securityQuestions: hashedSecurityQuestions};
    await userCollection.insertOne(user);
    const {accessToken, refreshToken} = getJwt(user);
    return {username, refreshToken, accessToken};
}

async function getUser(username, password) {
    const user = await userCollection.findOne({username, password: hash(password)});
    if (!user) return {error: "Wrong username or password"};
    const {accessToken, refreshToken} = getJwt(user);
    return {username, refreshToken, accessToken};
}

async function renewToken(refreshToken) {
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

function getSecurityQuestions() {
    const result = [];
    for (let i = 0; i < securityQuestions.length; i++) {
        result.push(securityQuestions[i]);
    }
    return result;
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
    return null;
}

function hash(str) {
    const hash = createHash("sha256");
    hash.update(str);
    return hash.digest("hex");
}

module.exports = {addUser, getUser, renewToken, getSecurityQuestions};