import {Player} from "/js/player.js";

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

export class HumanPlayer extends Player {
    /**
     * @param {string} name The player's name
     * @param {number} number The "number" of the player
     * @param {[number, number]} pos The player's position on the grid
     * @param {string} color The player's color
     * @param {string} avatar The player's avatar
     */
    constructor(name, number, pos = [0, 0], color = undefined, avatar = undefined) {
        super(name, number, pos, color, avatar);
        this.keys = number === 1 ? player1_keys : player2_keys;

        document.addEventListener("keypress", e => {
            let direction = this.keys[e.key.toUpperCase()];
            if (direction) super.setNextDirection(direction);
        });
    }
}