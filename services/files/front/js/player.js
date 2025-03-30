export const playerImages = ["/assets/spaceship.svg", "/assets/spaceship2.svg", "/assets/spaceship3.svg"];
export const playerColors = [{
    "primary-color": "#f43535",
    "secondary-color": "#f3b8b8"
},
    {
        "primary-color": "#f4b835",
        "secondary-color": "#f3e8b8"
    },
    {
        "primary-color": "#f4f435",
        "secondary-color": "#e8f3b8"
    },
    {
        "primary-color": "#35f4a5",
        "secondary-color": "#b8f3e8"
    },
    {
        "primary-color": "#35a5f4",
        "secondary-color": "#b8e8f3"
    },
    {
        "primary-color": "#354af4",
        "secondary-color": "#b8b8f3"
    }];

export const directionToAngle = {
    "up-right": 45,
    "right": 90,
    "down-right": 135,
    "down-left": 225,
    "left": 270,
    "up-left": 315
};

export class Player extends EventTarget {
    /** @type {string} */ name;
    /** @type {number} */ number;
    /** @type {[number, number]} */ pos;
    /** @type {string} */ color;
    /** @type {string} */ avatar;
    /** @type {"right"|"left"|"up-right"|"up-left"|"down-right"|"down-left"} */ direction;
    /** @type {"right"|"left"|"up-right"|"up-left"|"down-right"|"down-left"} */ nextDirection;
    /** @type {boolean} */ dead;

    #subscriptionCount = 0;

    /**
     * @param {string} name The player's name
     * @param {string} color The player's color
     * @param {string} avatar The player's avatar
     */
    constructor(name, color = undefined, avatar = undefined) {
        super();
        this.name = name;
        this.color = color;
        this.avatar = avatar;
    }

    /**
     * Initialise the player for a new game
     * @param {number} number The "number" of the player
     * @param {{pos:[number, number],direction:"right"|"left"|"up-right"|"up-left"|"down-right"|"down-left"}[]} playerStates The position and the direction of all players in the grid
     */
    init(number, playerStates) {
        this.number = number;

        this.color ??= playerColors[Math.floor(Math.random() * playerColors.length)]["primary-color"];
        this.avatar ??= playerImages[Math.floor(Math.random() * playerImages.length)];

        this.pos = playerStates[number - 1].pos;
        this.direction = this.nextDirection = playerStates[number - 1].direction;
        this.dead = false;
    }

    /**
     * Update the direction that the player is going to take
     * @param {"right"|"left"|"up-right"|"up-left"|"down-right"|"down-left"} direction The direction to set
     */
    setNextDirection(direction) {
        if ((directionToAngle[direction] + 180) % 360 === directionToAngle[this.direction]) return; // U-turns are prohibited
        this.nextDirection = direction;
    }

    addEventListener(type, listener, options) {
        super.addEventListener(type, listener, options);
        this.#subscriptionCount++;
        if (this.#subscriptionCount <= 1) this.subscribe();
    }

    removeEventListener(type, listener, options) {
        super.removeEventListener(type, listener, options);
        this.#subscriptionCount--;
        if (this.#subscriptionCount <= 0) this.unsubscribe();
    }

    subscribe() {
        this.#subscriptionCount = 1;
        // To be implemented by subclasses
    }

    unsubscribe() {
        this.#subscriptionCount = 0;
        // To be implemented by subclasses
    }
}
