const playerImages = ["assets/player_1.png", "assets/player_2.png"];
const playerColors = ["#D732A8", "#32BED7"];

export class Player {

    /**
     * @param {string} name The player's name
     * @param {string} number The "number" of the player
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
    }
}