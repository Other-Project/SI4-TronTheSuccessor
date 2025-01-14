import { Game } from "/js/game.js";
import { Player } from "/js/player.js";

export class GameBoard extends HTMLElement {
    gridSize = [16, 9];
    cellSize = 100;
    playerSize = 75;
    unconqueredColor = "#242424";

    constructor() {
        super();

        const shadow = this.attachShadow({ mode: "open" });

        let stylesheet = document.createElement("link");
        stylesheet.href = "/components/game-board/game-board.css";
        stylesheet.rel = "stylesheet";
        stylesheet.type = "text/css";
        shadow.appendChild(stylesheet);

        this.game = new Game(this.gridSize[0], this.gridSize[1], new Player("Player 1", 1), new Player("Player 2", 2));
        this.game.start();

        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        shadow.appendChild(this.canvas);

        this.#draw();
    }

    #cellCoordinates(x, y) {
        return [x * this.cellSize + (y * this.cellSize / 2) % this.cellSize + 2, y * this.cellSize * 3 / 4 + 2];
    }

    #draw() {
        this.canvas.width = this.gridSize[0] * this.cellSize + 4;
        this.canvas.height = this.cellSize + (this.gridSize[1] - 1) * this.cellSize * 3 / 4 + 4;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.#drawHexagons();
        this.game.players.forEach(player => this.#drawPlayer(player));
    }

    #drawHexagons() {
        this.game.grid.forEach((row, y) => row.forEach((cell, x) => this.#drawHexagon(x, y, cell)));
    }

    #drawHexagon(x, y, owner = 0) {
        if (owner === null) return; // No cell
        [x, y] = this.#cellCoordinates(x, y);
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
        this.ctx.fillStyle = this.game.players[owner - 1]?.color || this.unconqueredColor;
        this.ctx.fill();
    }

    /**
     * @param {Player} player The player to draw
     */
    #drawPlayer(player) {
        let [x, y] = this.#cellCoordinates(player.pos[0], player.pos[1]);
        let playerImg = new Image();
        playerImg.onload = () => this.ctx.drawImage(playerImg,
            x + (this.cellSize - this.playerSize) / 2,
            y + (this.cellSize - this.playerSize) / 2,
            this.playerSize,
            this.playerSize);
        playerImg.src = player.avatar ?? "";
    }
}
