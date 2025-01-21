import { Player } from "/js/player.js";

const player1_keys = {
    "up-left": ["Q", "Z"],
    "up-right": ["D", "Z"],
    "down-left": ["Q", "S"],
    "down-right": ["D", "S"],
    "left": ["Q"],
    "right": ["D"]
};
const player2_keys = {
    "up-left": ["ARROWUP", "ARROWLEFT"],
    "up-right": ["ARROWUP", "ARROWRIGHT"],
    "down-left": ["ARROWDOWN", "ARROWLEFT"],
    "down-right": ["ARROWDOWN", "ARROWRIGHT"],
    "left": ["ARROWLEFT"],
    "right": ["ARROWRIGHT"]
};

export class HumanPlayer extends Player {
    #keypressed;

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

        this.#keypressed = new Set();
        document.addEventListener("keydown", e => {
            this.#keypressed.add(e.key.toUpperCase());
            let direction = Object.entries(this.keys)
                .find(([_, keyComp]) => keyComp.every(k => Array.from(this.#keypressed).some(value => value.includes(k))));
            if (direction) super.setNextDirection(direction[0]);
        });
        document.addEventListener("keyup", e => {
            this.#keypressed.delete(e.key.toUpperCase());
        });
    }
}