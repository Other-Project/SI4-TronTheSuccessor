import {Game} from "/js/game.js";
import {HTMLComponent} from "/js/component.js";
import {HumanPlayer} from "/js/human-player.js";

const cells = {
    "up-left": [1, 0],
    "up-right": [2, 0],
    "left": [0, 1],
    "right": [2, 1],
    "down-left": [1, 2],
    "down-right": [2, 2]
}

const keyText = {
    "ArrowLeft": "←",
    "ArrowUp": "↑",
    "ArrowDown": "↓",
    "ArrowRight": "→"
}

export class Control extends HTMLComponent {
    gridSize = [4, 3];

    constructor() {
        super();

        this.gameBoard = document.createElement("app-game-board");
        this.shadowRoot.appendChild(this.gameBoard);

        const player = new HumanPlayer("Player 1");
        const owner = parseInt(this.getAttribute("owner"));
        player.init(owner, Array.from(Array(owner), () => ({pos: [1, 1], direction: owner === 1 ? "right" : "left"})));
        player.pos = [1, 1];

        const game = new Game(this.gridSize[0], this.gridSize[1], player, null, 1000);
        for (let x = 0; x < this.gridSize[0]; x++)
            for (let y = 0; y < this.gridSize[1]; y++)
                if (x % (this.gridSize[0] - 1) === 0 && y % (this.gridSize[1] - 1) === 0)
                    game.grid[y][x] = null;

        this.gameBoard.draw(game);
        this.gameBoard.ctx.font = "bold 36px Tomorrow";
        this.gameBoard.ctx.fillStyle = "white";
        this.gameBoard.ctx.textAlign = "center";
        this.gameBoard.ctx.textBaseline = "middle";

        Object.entries(cells).forEach(([direction, coords]) => {
            let [px, py] = this.gameBoard.cellCoordinates(coords[0], coords[1]);
            let text = player.keys[direction].map(k => keyText[k] || k).join("+")
            this.gameBoard.ctx.fillText(text, px + this.gameBoard.cellSize / 2, py + this.gameBoard.cellSize / 2);
        });
    }
}
