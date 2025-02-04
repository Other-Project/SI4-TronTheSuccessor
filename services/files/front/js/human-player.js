import {Player} from "/js/player.js";

export const player1_keys = {
    "up-left": ["Q", "Z"],
    "up-right": ["Z", "D"],
    "down-left": ["Q", "S"],
    "down-right": ["S", "D"],
    "left": ["Q"],
    "right": ["D"]
};
const player2_keys = {
    "up-left": ["ArrowLeft", "ArrowUp"],
    "up-right": ["ArrowUp", "ArrowRight"],
    "down-left": ["ArrowLeft", "ArrowDown"],
    "down-right": ["ArrowDown", "ArrowRight"],
    "left": ["ArrowLeft"],
    "right": ["ArrowRight"]
};

export class HumanPlayer extends Player {
    #keypressed;

    /**
     * @param {string} name The player's name
     * @param {string} color The player's color
     * @param {string} avatar The player's avatar
     */
    constructor(name, color = undefined, avatar = undefined) {
        super(name, color, avatar);

        this.#keypressed = new Set();
        document.addEventListener("keydown", e => {
            this.#keypressed.add(e.key.toUpperCase());
            let direction = Object.entries(this.keys)
                .find(([_, keyComp]) => keyComp.every(k => Array.from(this.#keypressed).some(value => value.includes(k.toUpperCase()))));
            if (direction) {
                super.setNextDirection(direction[0]);
                document.dispatchEvent(new CustomEvent("player-direction", {
                    detail: {
                        direction: direction[0],
                        number: number
                    }
                }));
            }
        });
        document.addEventListener("keyup", e => {
            this.#keypressed.delete(e.key.toUpperCase());
        });
    }

    init(number, playerStates) {
        super.init(number, playerStates);
        this.keys = number === 1 ? player1_keys : player2_keys;
    }
}