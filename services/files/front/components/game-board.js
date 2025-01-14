export class GameBoard extends HTMLElement {
    gridSize = [16, 9];
    cellSize = 100;
    playerSize = 75;
    playerColors = ["#242424", "#D732A8", "#32BED7"];

    constructor() {
        super();

        const shadow = this.attachShadow({ mode: "open" });
        this.canvas = document.createElement("canvas");
        this.canvas.style.maxWidth = "100%";
        this.canvas.style.maxHeight = "100%";
        this.canvas.width = 1700;
        this.canvas.height = 1000;
        this.ctx = this.canvas.getContext("2d");
        shadow.appendChild(this.canvas);

        this.#draw();
    }

    #cellCoordinates(x, y) {
        return [x * this.cellSize + (y * this.cellSize / 2) % this.cellSize + this.cellSize / 4, y * this.cellSize * 3 / 4 + this.cellSize / 4];
    }

    #draw() {
        this.#drawHaxagons(16, 9, 100);
        this.#drawPlayer(1, 8, 1);
        this.#drawPlayer(14, 0, 2);
    }

    #drawHaxagons() {
        for (let x = 0; x < this.gridSize[0]; x++)
            for (let y = 0; y < this.gridSize[1]; y++)
                this.#drawHexagon(x, y, x < 2 ? 1 : x > 13 ? 2 : null);
    }

    #drawHexagon(x, y, owner = null) {
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
        this.ctx.fillStyle = this.playerColors[owner] || this.playerColors[0];
        this.ctx.fill();
    }

    #drawPlayer(x, y, player) {
        [x, y] = this.#cellCoordinates(x, y);
        let playerImg = new Image();
        playerImg.onload = () => this.ctx.drawImage(playerImg,
            x + (this.cellSize - this.playerSize) / 2,
            y + (this.cellSize - this.playerSize) / 2,
            this.playerSize,
            this.playerSize);
        playerImg.src = `assets/player_${player}.png`;
    }
}
