const collections = require("./collections.js");
const {MongoClient} = require("mongodb");

const client = new MongoClient(process.env.MONGO_DB_URL ?? "mongodb://mongodb:27017");
const database = client.db("Tron-the-successor");
const dbCollection = database.collection("inventory");

exports.getCollection = async function (username) {
    const data = structuredClone(collections);
    if (username) {
        const userSelection = await exports.getSelection(username);
        for (const typeKey in data) {
            for (const itemKey in data[typeKey]) {
                const item = data[typeKey][itemKey];
                item.selected = item.id === userSelection[typeKey].id;
                item.owned = true; // Can be changed later if we want to add a system to unlock items
            }
        }
    }
    const response = {};
    for (const key in data) response[key] = Object.values(data[key]);
    console.debug(response);
    return response;
}

exports.getSelection = async function (username) {
    const userInventory = await dbCollection.findOne({username: username});
    const response = {};
    for (const key in collections) response[key] = collections[key][userInventory?.[key]?.selected] ?? getFirstItem(collections[key]);
    console.debug(username, userInventory, response);
    return response;
}

function getFirstItem(dictionary) {
    // noinspection LoopStatementThatDoesntLoopJS
    for (const key in dictionary) return dictionary[key];
}

exports.updateSelection = async function (username, selection) {
    const userInventory = await dbCollection.findOne({username: username});
    console.debug(username, userInventory);
    const authorisedKeys = Object.keys(collections);
    const document = Object.entries(selection).filter(([key, _]) => authorisedKeys.includes(key));
    if (!userInventory)
        console.debug(await dbCollection.insertOne({
            username: username, ...document.reduce((acc, [key, value]) => ({
                ...acc,
                [key]: {"selected": value}
            }), {})
        }));
    else
        console.debug(await dbCollection.updateOne({username: username}, {
            $set: document.reduce((acc, [key, value]) => ({
                ...acc,
                [`${key}.selected`]: value
            }), {})
        }));
}
