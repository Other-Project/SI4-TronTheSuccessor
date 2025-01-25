import {Game} from "/js/game.js";
import {HumanPlayer} from "/js/human-player.js";
import {HTMLComponent} from "/js/component.js";
import {FlowBird} from "/js/flowbird.js";

export class GameMaster extends HTMLComponent {
    gridSize = [16, 9];

    constructor() {
        super("game-master", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.gameBoard = this.shadowRoot.getElementById("board");
        this.popupWindow = this.shadowRoot.getElementById("popup-container");

        this.popupTitle = this.shadowRoot.getElementById("title");
        this.popupTime = this.shadowRoot.getElementById("time");
        this.popupDescription = this.shadowRoot.getElementById("description");

        this.shadowRoot.getElementById("restart").addEventListener("click", () => this.newGame());
        this.shadowRoot.getElementById("home").addEventListener("click", () => {
            document.dispatchEvent(new CustomEvent("menu-selection", {detail: "home"}));
        });
    }

    onVisible = () => this.newGame();
    onHidden = () => this.stopGame();

    newGame() {
        this.popupWindow.style.display = "none";
        this.stopGame();
        const flowBird = new FlowBird();
        this.game = new Game(this.gridSize[0], this.gridSize[1], new HumanPlayer("Player 1", 1), flowBird, 500);
        flowBird.setGame(this.game);
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
        this.popupTitle.innerText = details.draw ? "Draw" : details.winner.name + " won";
        this.popupTime.innerText = `${String(Math.floor((details.elapsed / 1000) / 60)).padStart(2, '0')}'${String(Math.floor((details.elapsed / 1000) % 60)).padStart(2, '0')}"`;
        this.popupDescription.innerText = "";
    }
}
