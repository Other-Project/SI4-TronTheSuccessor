const directionToAngle = {
    "up-right": 45,
    "right": 90,
    "down-right": 135,
    "down-left": 225,
    "left": 270,
    "up-left": 315,
}

exports.directionToAngle = directionToAngle;

exports.Player = class Player {
    /** @type {string} */ id;
    /** @type {string} */ name;
    /** @type {number} */ number;
    /** @type {[number, number]} */ pos;
    /** @type {string} */ color;
    /** @type {string} */ avatar;
    /** @type {"right"|"left"|"up-right"|"up-left"|"down-right"|"down-left"} */ direction;
    /** @type {"right"|"left"|"up-right"|"up-left"|"down-right"|"down-left"} */ nextDirection;
    /** @type {boolean} */ dead;

    /**
     * @param {string} id The socket id of the player
     * @param {string} name The player's name
     * @param {string} color The player's color
     * @param {string} avatar The player's avatar
     */
    constructor(id, name, color = undefined, avatar = undefined) {
        this.id = id;
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

        this.pos = playerStates[number - 1].pos;
        this.direction = this.nextDirection = playerStates[number - 1].direction;
        this.dead = false;
    }

    setNextDirection(direction) {
        if ((directionToAngle[direction] + 180) % 360 === directionToAngle[this.direction]) return; // U-turns are prohibited
        this.nextDirection = direction;
    }
};
