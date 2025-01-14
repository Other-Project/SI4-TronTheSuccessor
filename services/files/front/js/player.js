const playerImages = ["assets/player_1.png", "assets/player_2.png"];
const playerColors = ["#D732A8", "#32BED7"];

const keys = {
    "A": "up-left",
    "E": "up-right",
    "Q": "left",
    "D": "right",
    "W": "down-left",
    "X": "down-right"
};
export const directions = {
    "up-left": [0, 1],
    "up-right": [1, 1],
    "left": [-1, 0],
    "right": [1, 0],
    "down-left": [0, -1],
    "down-right": [1, -1]
};

export class Player {
    /** @type {string} */ name;
    /** @type {[number, number]} */ pos;
    /** @type {string} */ color;
    /** @type {string} */ avatar;
    /** @type {"right"|"left"|"up-right"|"up-left"|"down-right"|"down-left"} */ direction;
    /** @type {"right"|"left"|"up-right"|"up-left"|"down-right"|"down-left"} */ nextDirection;

    /**
     * @param {string} name The player's name
     * @param {string} number The "number" of the player
     * @param {[number, number]} pos The player's position on the grid
     * @param {string} color The player's color
     * @param {string} avatar The player's avatar
     */
    constructor(name, number, pos = [0, 0], color = playerColors[number - 1], avatar = playerImages[number - 1]) {
        this.name = name;
        this.pos = pos;
        this.color = color;
        this.avatar = avatar;
        this.direction = this.nextDirection = number % 2 === 0 ? "right" : "left";

        document.addEventListener("keypress", e => {
            if (keys[e.key]) this.nextDirection = keys[e.key];
        });
    }
}