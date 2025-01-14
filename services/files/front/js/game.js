export class Game {

    /**
     * @param {number} w Width of the game map
     * @param {number} h Height of the game map
     * @param {Player} player1 The first player of the game
     * @param {Player} player2 The second player of the game
     */
    constructor(w, h, player1, player2) {
        this.gridSize = [w, h];
        this.players = [player1, player2];
        this.grid = Array.from(Array(h), (_, i) => Array(i % 2 === 0 ? w : w - 1).fill(0));
    }

    start() {
        this.players[0].pos = [0, Math.round(Math.random() * this.gridSize[1] / 4) * 2];
        this.players[1].pos = [this.gridSize[0] - 1, this.gridSize[1] - 1 - this.players[0].pos[1]];
    }
}