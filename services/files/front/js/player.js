const playerImages = ["assets/player_1.png", "assets/player_2.png"];
const playerColors = ["#D732A8", "#32BED7"];

const player1_keys = {
    "A": "up-left",
    "E": "up-right",
    "Q": "left",
    "D": "right",
    "W": "down-left",
    "X": "down-right"
};
const player2_keys = {
    "7": "up-left",
    "9": "up-right",
    "4": "left",
    "6": "right",
    "1": "down-left",
    "3": "down-right"
};


export const directions = {
    "up-left": [0, -1],
    "up-right": [1, -1],
    "left": [-1, 0],
    "right": [1, 0],
    "down-left": [0, 1],
    "down-right": [1, 1]
};

export class Player {
    /** @type {string} */ name;
    /** @type {number} */ number;
    /** @type {[number, number]} */ pos;
    /** @type {string} */ color;
    /** @type {string} */ avatar;
    /** @type {"right"|"left"|"up-right"|"up-left"|"down-right"|"down-left"} */ direction;
    /** @type {"right"|"left"|"up-right"|"up-left"|"down-right"|"down-left"} */ nextDirection
    /** @type {boolean} */ dead;

    /**
     * @param {string} name The player's name
     * @param {number} number The "number" of the player
     * @param {[number, number]} pos The player's position on the grid
     * @param {string} color The player's color
     * @param {string} avatar The player's avatar
     */
    constructor(name, number, pos = [0, 0], color = playerColors[number - 1], avatar = playerImages[number - 1]) {
        this.name = name;
        this.number = number;
        this.pos = pos;
        this.color = color;
        this.avatar = avatar;
        this.direction = this.nextDirection = number === 1 ? "right" : "left";
        this.keys = number === 1 ? player1_keys : player2_keys;
        this.dead = false;

        document.addEventListener("keypress", e => {
            if (this.keys[e.key.toUpperCase()]) this.nextDirection = this.keys[e.key.toUpperCase()];
        });
    }
}