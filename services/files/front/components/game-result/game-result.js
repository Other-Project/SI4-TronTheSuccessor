import {HTMLComponent} from "/js/component.js";
import {Game} from "/js/game.js";
import {Player} from "/js/player.js";

export class GameResult extends HTMLComponent {
    #gameData;
    gameBoard;
    gameActions;
    game;
    player1;
    player2;
    #gameReplayInterval = 500;
    width = 16;
    height = 9;
    replayIndex = 0;

    constructor() {
        super("game-result", ["html", "css"]);
    }

    set gameData(data) {
        this.#gameData = data;
    }

    onSetupCompleted = () => {
        if (this.#gameData)
            this.updateDisplay();


        this.gameBoard = this.shadowRoot.getElementById("board");
        this.boardContainer = this.shadowRoot.getElementById("board-container");
        this.shadowRoot.getElementById("game-result").addEventListener("click", () => {
            this.boardContainer.classList.toggle("show") ? this.#updateGameBoard() : clearInterval(this.replayTimer);
        });
        this.player1 = new Player("Test 1");
        this.player2 = new Player("Test 2");
        this.game = new Game(this.width, this.height, this.player1, this.player2, 0);
    };

    updateDisplay() {
        const statusElement = this.shadowRoot.querySelector(".status");
        const opponentElement = this.shadowRoot.querySelector(".opponent");
        const gameLengthValue = this.shadowRoot.querySelector(".game-length-value");
        const dateElement = this.shadowRoot.querySelector(".date");

        const opponent = this.#gameData.opponentName;
        const result = !this.#gameData.winner ? "Draw" : this.#gameData.winner === this.#gameData.opponentName ? "Defeat" : "Victory";

        statusElement.textContent = result;
        statusElement.className = "status " + result.toLowerCase();

        opponentElement.textContent = opponent;
        gameLengthValue.textContent = this.formatGameLength(this.#gameData.timeElapsed);
        dateElement.textContent = new Date(this.#gameData.date).toLocaleDateString();
        this.gameActions = this.#gameData.gameActions;
        this.shadowRoot.getElementById("game-result-container").style.display = "grid";
    }

    formatGameLength(durationInMsSeconds) {
        const seconds = Math.floor(durationInMsSeconds / 1000);
        const ms = durationInMsSeconds % 1000;
        return `${seconds}s ${ms}ms`;
    }

    #clearReplay() {
        this.game.grid = Array.from(Array(this.height), (_, i) => Array(i % 2 === 0 ? this.width : this.width - 1).fill(0));
    }

    #updateGameBoard() {
        this.#clearReplay();
        this.#initializePlayers();
        this.replayIndex = 0;
        this.#drawTillTurn(this.gameActions.length - 1);
    }

    #initializePlayers() {
        if (!this.gameActions || !this.gameActions.length) return;

        const initialState = this.gameActions[0];
        this.player1.init(1, initialState);
        this.player2.init(2, initialState);
    }

    #drawTillTurn(turn) {
        this.#renderGameState(this.replayIndex);
        this.replayTimer = setInterval(() => {
            this.replayIndex++;
            this.#renderGameState(this.replayIndex);
            if (this.replayIndex >= turn) {
                clearInterval(this.replayTimer);
            }
        }, this.#gameReplayInterval);
    }

    #renderGameState(turnIndex) {
        if (!this.gameActions || turnIndex >= this.gameActions.length) return;
        this.game.setPlayerStates(this.gameActions[turnIndex]);
        this.game.players.forEach(player => {
            this.game.updateGrid(player);
        });
        this.gameBoard.draw(this.game);
    }
}
