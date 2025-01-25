import {Game} from "/js/game.js";
import {HumanPlayer} from "/js/human-player.js";
import {HTMLComponent} from "/js/component.js";

export class GameMaster extends HTMLComponent {
    gridSize = [16, 9];

    constructor() {
        super("game-master", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.gameBoard = this.shadowRoot.getElementById("board");
        this.popupWindow = this.shadowRoot.getElementById("popup-container");
        this.popupWindow.style.display = "none";
    }

    onVisible = () => this.newGame();
    onHidden = () => this.stopGame();

    newGame() {
        this.stopGame();
        this.game = new Game(this.gridSize[0], this.gridSize[1], new HumanPlayer("Player 1", 1), new HumanPlayer("Player 2", 2), 500);
        this.game.addEventListener("game-turn", (e) => {
            if (e.detail.ended) this.endScreen(e.detail);
            this.gameBoard.draw(this.game);
        });
        this.game.start();
        this.gameBoard.draw(this.game);
    }

    stopGame() {
        if (this.game) this.game.stop();
        this.game = undefined;
    }

    endScreen(details) {
        this.popupWindow.style.display = "block";
        alert(details.draw ? "Draw" : details.winner.name + " won");
    }
}
