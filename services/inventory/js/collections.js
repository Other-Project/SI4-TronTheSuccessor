exports.avatars = Object.fromEntries([
    {
        "name": "Mike",
        "id": "mike"
    },
    {
        "name": "Luna",
        "id": "luna"
    },
    {
        "name": "Zara",
        "id": "zara"
    },
    {
        "name": "Ravi",
        "id": "ravi"
    },
    {
        "name": "Kai",
        "id": "kai"
    }
].map(item => [item.id, item]));

exports.spaceships = Object.fromEntries([
    {
        "name": "Zephyr Interceptor",
        "id": "1",
    },
    {
        "name": "Astra Explorer",
        "id": "2"
    },
    {
        "name": "Stellar Cruiser",
        "id": "3"
    }
].map(item => [item.id, item]));

exports.firstChoiceColors = Object.fromEntries([
    {
        "name": "Pink",
        "id": "pink",
        "cell-color": "#D732A8",
        "primary-color": "#d99dc2",
        "secondary-color": "#ffe5fe"
    },
    {
        "name": "Blue",
        "id": "blue",
        "cell-color": "#32BED7",
        "primary-color": "#0088a0",
        "secondary-color": "#bffaff"
    },
    {
        "name": "Orange",
        "id": "orange",
        "cell-color": "#F6B93B",
        "primary-color": "#a7895a",
        "secondary-color": "#ffedcb",
    },
    {
        "name": "Rainforest Vibe",
        "id": "rainforest",
        "cell-color": "#4CAF50",
        "primary-color": "#4a7247",
        "secondary-color": "#dbf9d8",
    }
].map(item => [item.id, item]));

exports.secondChoiceColors = Object.fromEntries([
    {
        "name": "Purple",
        "id": "purple",
        "cell-color": "#8E24AA",
        "primary-color": "#7b4b8a",
        "secondary-color": "#e9d3e9"
    },
    {
        "name": "Ocean Blue",
        "id": "ocean-blue",
        "cell-color": "#2196F3",
        "primary-color": "#005cbf",
        "secondary-color": "#cce4ff"
    },
    {
        "name": "Yellow",
        "id": "yellow",
        "cell-color": "#FFEB3B",
        "primary-color": "#bdb17a",
        "secondary-color": "#fbf1ca"
    },
    {
        "name": "Mint Green",
        "id": "mint-green",
        "cell-color": "#508f7e",
        "primary-color": "#85c5b3",
        "secondary-color": "#c7fcec"
    }
].map(item => [item.id, item]));
