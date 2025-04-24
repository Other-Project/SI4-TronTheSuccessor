import {Player} from "/js/player.js";

export const player1_keys = {
    "up-left": ["Q", "Z"],
    "up-right": ["Z", "D"],
    "down-left": ["Q", "S"],
    "down-right": ["S", "D"],
    "left": ["Q"],
    "right": ["D"]
};
export const player2_keys = {
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
     @param {string} name The player's name
     @param {{"cell-color": string, "primary-color": string, "secondary-color": string}} color The player's color
     @param {string} spaceship The player's spaceship
     */
    constructor(name, color, spaceship) {
        super(name, color, spaceship);
        this.#keypressed = new Set();
    }

    init(number, playerStates) {
        super.init(number, playerStates);
        this.keys = number === 1 ? player1_keys : player2_keys;
        this.subscribe();
    }

    subscribe() {
        super.subscribe();
        this.#keypressed.clear();
        document.addEventListener("keydown", this.#onKeyPressed);
        document.addEventListener("keyup", this.#onKeyReleased);
    }

    unsubscribe() {
        super.unsubscribe();
        document.removeEventListener("keydown", this.#onKeyPressed);
        document.removeEventListener("keyup", this.#onKeyReleased);
    }

    #onKeyPressed = e => {
        if (e.repeat) return; // Ignore repeated key presses
        this.#keypressed.add(e.key.toUpperCase());
        let direction = Object.entries(this.keys)
            .find(([_, keyComp]) => keyComp.every(k => Array.from(this.#keypressed).some(value => value.includes(k.toUpperCase()))));
        this.changeDirection(direction?.[0]);
    }

    changeDirection(direction) {
        if (!direction) return;
        super.setNextDirection(direction);
        this.dispatchEvent(new CustomEvent("player-direction", {
            detail: {
                direction: direction,
                number: this.number
            }
        }));
    }

    #onKeyReleased = e => this.#keypressed.delete(e.key.toUpperCase());
}
