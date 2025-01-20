import {Game} from "/js/game.js";
import {HumanPlayer} from "/js/human-player.js";

export class GameMaster extends HTMLElement {
    gridSize = [16, 9];

    constructor() {
        super();

        const shadow = this.attachShadow({mode: "open"});
        const gameBoard = document.createElement("app-game-board");
        shadow.appendChild(gameBoard);

        const game = new Game(this.gridSize[0], this.gridSize[1], new HumanPlayer("Player 1", 1), new HumanPlayer("Player 2", 2), 1000);

        game.addEventListener("game-turn", (e) => {
            if (e.detail.ended) alert(e.detail.draw ? "Draw" : e.detail.winner.name + " won");
            gameBoard.draw(game);
        });
        game.start();
        gameBoard.draw(game);
    }
}
