const {Player} = require("./player.js");

exports.Game = class Game extends EventTarget {
    gridSize;
    players;
    grid;
    #startTime;
    #turnDuration;
    #gameLife;

    /**
     * @param {number} w Width of the game map
     * @param {number} h Height of the game map
     * @param {Player} player1 The first player of the game
     * @param {Player} player2 The second player of the game
     * @param {number} turnDuration The duration of a game turn
     */
    constructor(w, h, player1, player2, turnDuration = 500) {
        super();
        this.gridSize = [w, h];
        this.players = [player1, player2];
        this.grid = Array.from(Array(h), (_, i) => Array(i % 2 === 0 ? w : w - 1).fill(0));
        this.#turnDuration = turnDuration;
    }

    start() {
        this.players[0].pos = [0, Math.round(Math.random() * this.gridSize[1] / 4) * 2];
        this.players[1].pos = [this.gridSize[0] - 1, this.gridSize[1] - 1 - this.players[0].pos[1]];
        this.players.forEach(player => this.#updateGrid(player));
        let winner = this.isGameEnded();
        this.dispatchEvent(new CustomEvent("game-turn", {detail: this.getInfo(winner)}));
        this.#gameLife = setInterval(() => this.gameTurn(), this.#turnDuration);
        this.#startTime = +new Date();
    }

    stop() {
        if (this.isPaused()) return;
        const details = this.getInfo();
        this.#startTime -= new Date();
        clearInterval(this.#gameLife);
        this.#gameLife = null;
        return details;
    }

    resume() {
        if (!this.isPaused()) return;
        this.#startTime += +new Date();
        this.#gameLife = setInterval(() => this.gameTurn(), this.#turnDuration);
    }

    isPaused() {
        return !this.#gameLife;
    }

    getInfo(winner) {
        winner ??= this.isGameEnded();
        return {
            ended: !!winner,
            draw: winner ? winner === true : undefined,
            winner: winner && winner instanceof Player ? winner.name : undefined,
            elapsed: new Date() - this.#startTime
        };
    }

    #updateGrid(player) {
        if (!this.grid[player.pos[1]] || this.grid[player.pos[1]][player.pos[0]] !== 0) player.dead = true;
        else this.grid[player.pos[1]][player.pos[0]] = player.number;
    }

    gameTurn() {
        const newPositions = this.players.map((player) => {
            return this.#getNewPosition(player.pos, player.nextDirection);
        });
        if (newPositions[0][0] === newPositions[1][0] && newPositions[0][1] === newPositions[1][1]) {
            this.players.forEach((player) => player.dead = true);
        }
        this.players.forEach((player) => {
            if (player.dead) return;
            player.pos = this.#getNewPosition(player.pos, player.nextDirection);
            player.direction = player.nextDirection;
            this.#updateGrid(player);
        });

        let winner = this.isGameEnded();
        this.dispatchEvent(new CustomEvent("game-turn", {detail: this.getInfo(winner)}));
        if (winner) this.stop();
    }

    isGameEnded() {
        let alive = this.players.filter((player) => !player.dead);
        if (alive.length === 0) return true;
        else if (alive.length === 1) return alive[0];
        else return false;
    }

    /**
     * @param {[number, number]} currentPosition Current position of the player
     * @param {"right"|"left"|"up-right"|"up-left"|"down-right"|"down-left"} direction Direction the player wants to go
     */
    #getNewPosition(currentPosition, direction) {
        switch (direction) {
            case "left":
                return [currentPosition[0] - 1, currentPosition[1]];
            case "right":
                return [currentPosition[0] + 1, currentPosition[1]];
            case "up-left":
                return currentPosition[1] % 2 ? [currentPosition[0], currentPosition[1] - 1] : [currentPosition[0] - 1, currentPosition[1] - 1];
            case "down-right":
                return currentPosition[1] % 2 ? [currentPosition[0] + 1, currentPosition[1] + 1] : [currentPosition[0], currentPosition[1] + 1];
            case "up-right":
                return currentPosition[1] % 2 ? [currentPosition[0] + 1, currentPosition[1] - 1] : [currentPosition[0], currentPosition[1] - 1];
            case "down-left":
                return currentPosition[1] % 2 ? [currentPosition[0], currentPosition[1] + 1] : [currentPosition[0] - 1, currentPosition[1] + 1];
        }
    }
}
