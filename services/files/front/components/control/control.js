import {Game} from "/js/game.js";
import {Player} from "/js/player.js";
import {HTMLComponent} from "/js/component.js";

export class Control extends HTMLComponent {
    gridSize = [4, 3];
    playersInput = [["A", "E", "Q", "S", "D", "W", "X"], ["7", "9", "4", "5", "6", "1", "3"]];
    count = 0;

    constructor() {
        super();

        this.gameBoard = document.createElement("app-game-board");
        this.shadowRoot.appendChild(this.gameBoard);

        const game = new Game(this.gridSize[0], this.gridSize[1], new Player("Player 1", 1, [1, 1]), null, 1000);
        for (let x = 0; x < this.gridSize[0]; x++)
            for (let y = 0; y < this.gridSize[1]; y++)
                if (x % (this.gridSize[0] - 1) === 0 && y % (this.gridSize[1] - 1) === 0)
                    game.grid[y][x] = null;

        this.gameBoard.draw(game);
        this.gameBoard.ctx.font = 'bold 5.5em Arial';
        this.gameBoard.ctx.fillStyle = 'white';
        this.gameBoard.ctx.textAlign = 'center';
        this.gameBoard.ctx.textBaseline = 'middle';

        game.grid.forEach((row, y) => row.forEach((cell, x) => {
            if (cell === null) return;
            let [px, py] = this.gameBoard.cellCoordinates(x, y);
            this.gameBoard.ctx.fillText(this.playersInput[parseInt(this.getAttribute('owner')) - 1][this.count++], px + this.gameBoard.cellSize / 2, py + this.gameBoard.cellSize / 2);
        }));
    }
}
