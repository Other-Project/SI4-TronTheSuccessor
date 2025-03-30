exports.avatars = [
    {
        "name": "Mike",
        "asset_url": "1"
    },
    {
        "name": "Luna",
        "asset_url": "2"
    },
    {
        "name": "Zara",
        "asset_url": "3"
    },
    {
        "name": "Ravi",
        "asset_url": "4"
    },
    {
        "name": "Kai",
        "asset_url": "5"
    }
];
exports.spaceships = [
    {
        "name": "Zephyr Interceptor",
        "asset_url": "1"
    },
    {
        "name": "Astra Explorer",
        "asset_url": "2"
    },
    {
        "name": "Stellar Cruiser",
        "asset_url": "3"
    }
];
exports.firstChoiceColors = [
    {
        "name": "Pink",
        "cell-color": "#D732A8",
        "primary-color": "#d99dc2",
        "secondary-color": "#ffe5fe"
    },
    {
        "name": "Blue",
        "cell-color": "#32BED7",
        "primary-color": "#0088a0",
        "secondary-color": "#bffaff"
    },
    {
        "name": "Orange",
        "cell-color": "#F6B93B",
        "primary-color": "#a7895a",
        "secondary-color": "#ffedcb",
    },
    {
        "name": "Rainforest Vibe",
        "cell-color": "#4CAF50",
        "primary-color": "#4a7247",
        "secondary-color": "#dbf9d8",
    }
];
exports.secondChoiceColors = [
    {
        "name": "Purple",
        "cell-color": "#8E24AA",
        "primary-color": "#7b4b8a",
        "secondary-color": "#e9d3e9"
    },
    {
        "name": "Ocean Blue",
        "cell-color": "#2196F3",
        "primary-color": "#005cbf",
        "secondary-color": "#cce4ff"
    },
    {
        "name": "Yellow",
        "cell-color": "#FFEB3B",
        "primary-color": "#bdb17a",
        "secondary-color": "#fbf1ca"
    },
    {
        name: "Mint Green",
        "cell-color": "#508f7e",
        "primary-color": "#85c5b3",
        "secondary-color": "#c7fcec"
    }
]


exports.getCollection = function () {
    const response = {};
    response.firstChoiceColors = exports.firstChoiceColors.map((item, i) => ({...item, owned: true, selected: i === 0}));
    response.secondChoiceColors = exports.secondChoiceColors.map((item, i) => ({...item, owned: true, selected: i === 0}));
    response.spaceships = exports.spaceships.map((item, i) => ({...item, owned: true, selected: i === 0}));
    response.avatars = exports.avatars.map((item, i) => ({...item, owned: true, selected: i === 0}));
    return response;
}
