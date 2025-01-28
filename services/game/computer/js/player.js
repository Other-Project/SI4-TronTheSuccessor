const playerImages = ["assets/player_1.png", "assets/player_2.png"];
const playerColors = ["#D732A8", "#32BED7"];

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
        this.dead = false;
    }

    setNextDirection(direction) {
        if ((directionToAngle[direction] + 180) % 360 === directionToAngle[this.direction]) return; // U-turns are prohibited
        this.nextDirection = direction;
    }
}

