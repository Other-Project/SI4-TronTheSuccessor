import {directionToAngle, Player} from "/js/player.js";
import {HTMLComponent} from "/js/component.js";
import {loadSpaceShip} from "/js/svg-utils.js";

export class GameBoard extends HTMLComponent {
    cellSize = 200;
    playerSize = this.cellSize * 0.75;
    unconqueredColor = "#242424";
    collisionColor = "#f43535";

    constructor() {
        super("game-board", ["css"]);
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.shadowRoot.appendChild(this.canvas);
    }

    cellCoordinates(x, y) {
        return [x * this.cellSize + (y * this.cellSize / 2) % this.cellSize + 2, y * this.cellSize * 3 / 4 + 2];
    }

    async draw(game) {
        if (!this.canvas) return;
        this.canvas.width = game.grid[0].length * this.cellSize + 4;
        this.canvas.height = this.cellSize + (game.grid.length - 1) * this.cellSize * 3 / 4 + 4;
        this.#drawHexagons(game);
        for (let player of game.players)
            if (player) await this.#drawPlayer(player);
    }

    clear() {
        if (!this.ctx) return;
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    #drawHexagons(game) {
        game.grid.forEach((row, y) => row.forEach((cell, x) => {
            if (cell !== null) this.#drawHexagon(x, y, game.players[cell - 1]?.color || (cell === 0 ? this.unconqueredColor : this.collisionColor));
        }));
    }

    #drawHexagon(x, y, ownerColor) {
        [x, y] = this.cellCoordinates(x, y);
        this.ctx.beginPath();
        this.ctx.moveTo(x + this.cellSize / 2, y);
        this.ctx.lineTo(x, y + this.cellSize / 4);
        this.ctx.lineTo(x, y + this.cellSize * 3 / 4);
        this.ctx.lineTo(x + this.cellSize / 2, y + this.cellSize);
        this.ctx.lineTo(x + this.cellSize, y + this.cellSize * 3 / 4);
        this.ctx.lineTo(x + this.cellSize, y + this.cellSize / 4);
        this.ctx.lineTo(x + this.cellSize / 2, y);
        this.ctx.strokeStyle = "#656565";
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        this.ctx.fillStyle = ownerColor;
        this.ctx.fill();
    }


    /**
     * Draw a player on the game board
     * @param {Player} player The player to draw
     */
    async #drawPlayer(player) {
        if (player.dead) return;
        let [x, y] = this.cellCoordinates(player.pos[0], player.pos[1]);
        const playerImg = await loadSpaceShip(player.avatar, player.color);

        this.ctx.setTransform(1, 0, 0, 1, x + this.cellSize / 2, y + this.cellSize / 2);
        this.ctx.rotate(directionToAngle[player.direction] / 180 * Math.PI);
        this.ctx.drawImage(playerImg,
            -this.playerSize / 2,
            -this.playerSize / 2,
            this.playerSize,
            this.playerSize);
    }
}
