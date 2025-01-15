export class Control extends HTMLElement {
    gridSize = [2, 3];
    cellSize = 100;
    playerSize = 75;
    playerColors = ["#242424", "#D732A8", "#32BED7"];
    constructor() {
        super();

        const shadow = this.attachShadow({mode: "open"});

        let stylesheet = document.createElement("link");
        stylesheet.href = "/components/game-board/game-board.css";
        stylesheet.rel = "stylesheet";
        stylesheet.type = "text/css";
        shadow.appendChild(stylesheet);

        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        shadow.appendChild(this.canvas);

        this.#draw();
    }

    #cellCoordinates(x, y) {
        return [x * this.cellSize + (y * this.cellSize / 2) % this.cellSize, y * this.cellSize * 3 / 4];
    }

    #draw() {
        this.canvas.width = this.gridSize[0] * this.cellSize + this.cellSize / 2;
        this.canvas.height = this.cellSize + (this.gridSize[1] - 1) * this.cellSize * 3 / 4;
        this.#drawHexagons();
        this.#drawPlayer(1, 8, 1);
        this.#drawPlayer(14, 0, 2);
    }

    #drawHexagons() {
        for (let y = 0; y < this.gridSize[1]; y++)
            for (let x = 0; x < this.gridSize[0] + x % 2; x++)
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
