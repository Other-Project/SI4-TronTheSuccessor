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
    replayTimer;

    constructor() {
        super("game-result", ["html", "css"]);
    }

    set gameData(data) {
        this.#gameData = data;
    }

    onSetupCompleted = () => {
        this.gameBoard = this.shadowRoot.getElementById("board");
        this.boardContainer = this.shadowRoot.getElementById("board-container");
        this.chevron = this.shadowRoot.getElementById("chevron");
        this.shadowRoot.getElementById("game-result").addEventListener("click", () => {
            if (!this.boardContainer.classList.toggle("show")) clearInterval(this.replayTimer);
            this.chevron.classList.toggle("rotate");
        });

        this.boardRange = this.shadowRoot.getElementById("board-range");
        this.boardRange.addEventListener("input", () => {
            this.#drawTillTurn(this.boardRange.value);
        });

        this.playPauseBtn = this.shadowRoot.getElementById("play-pause");
        this.playPauseBtnImg = this.playPauseBtn.querySelector("img");
        this.playPauseBtn.addEventListener("click", () => {
            if (this.playPauseBtn.classList.toggle("playing")) {
                if (this.boardRange.value >= this.gameActions.length - 1) {
                    this.#clearReplay();
                    this.boardRange.value = 0;
                } else {
                    this.boardRange.value = Math.min(parseInt(this.boardRange.value) + 1, this.gameActions.length - 1);
                }
                this.#playTillEnd();
                this.playPauseBtnImg.src = "/assets/pause.svg";
            } else {
                clearInterval(this.replayTimer);
                this.playPauseBtnImg.src = "/assets/play.svg";
            }
        });

        this.shadowRoot.getElementById("previous-btn").addEventListener("click", () => {
            if (this.boardRange.value <= 0) return;
            this.#handleReplayControls(-1);
        });

        this.shadowRoot.getElementById("next-btn").addEventListener("click", () => {
            if (this.boardRange.value >= this.gameActions.length - 1) return;
            this.#handleReplayControls(1);
        });

        this.player1 = new Player("Test 1");
        this.player2 = new Player("Test 2");
        this.game = new Game(this.width, this.height, this.player1, this.player2, 0);

        if (this.#gameData)
            this.updateDisplay();
    };

    updateDisplay() {
        const statusElement = this.shadowRoot.querySelector(".status");
        const opponentElement = this.shadowRoot.querySelector(".opponent");
        const gameLengthValue = this.shadowRoot.querySelector(".game-length-value");
        const dateElement = this.shadowRoot.querySelector(".date");

        const result = !this.#gameData.winner ? "Draw" : this.#gameData.winner === this.#gameData.opponentName ? "Defeat" : "Victory";

        statusElement.textContent = result;
        statusElement.className = "status " + result.toLowerCase();

        opponentElement.textContent = this.#gameData.opponentName;
        gameLengthValue.textContent = this.formatGameLength(this.#gameData.timeElapsed);
        dateElement.textContent = new Date(this.#gameData.date).toLocaleDateString();
        this.gameActions = this.#gameData.gameActions;
        this.boardRange.max = this.gameActions.length - 1;
        this.#initializePlayers();
        this.#drawTillTurn(0);
    }

    formatGameLength(durationInMsSeconds) {
        const seconds = Math.floor(durationInMsSeconds / 1000);
        const ms = durationInMsSeconds % 1000;
        return `${seconds}s ${ms}ms`;
    }

    #clearReplay() {
        this.game.grid = Array.from(Array(this.height), (_, i) => Array(i % 2 === 0 ? this.width : this.width - 1).fill(0));
    }

    #initializePlayers() {
        if (!this.gameActions || !this.gameActions.length) return;

        const initialState = this.gameActions[0];
        this.player1.init(1, initialState);
        this.player2.init(2, initialState);
    }

    #handleReplayControls(step) {
        clearInterval(this.replayTimer);
        this.playPauseBtnImg.src = "/assets/play.svg";
        this.playPauseBtn.classList.remove("playing");
        this.boardRange.value = parseInt(this.boardRange.value) + step;
        this.#drawTillTurn(this.boardRange.value);
    }

    #playTillEnd() {
        clearInterval(this.replayTimer);
        this.#renderGameState(this.boardRange.value);
        this.playPauseBtnImg.src = "/assets/pause.svg";

        this.replayTimer = setInterval(() => {
            if (++this.boardRange.value >= this.gameActions.length) {
                clearInterval(this.replayTimer);
                this.playPauseBtnImg.src = "/assets/play.svg";
                this.playPauseBtn.classList.remove("playing");
                return;
            }
            this.#renderGameState(this.boardRange.value);
        }, this.#gameReplayInterval);
    }

    #drawTillTurn(turn) {
        clearInterval(this.replayTimer);
        this.playPauseBtnImg.src = "/assets/play.svg";
        if (this.playPauseBtn.classList.contains("playing")) this.playPauseBtn.classList.remove("playing");
        this.#clearReplay();
        for (let i = 0; i <= turn; i++) {
            this.#renderGameState(i);
        }
    }

    #renderGameState(turnIndex) {
        if (!this.gameActions || turnIndex >= this.gameActions.length) return;
        this.game.setPlayerStates(this.gameActions[turnIndex], this.#gameData.playerNum === 2);
        this.game.players.forEach(player => {
            this.game.updateGrid(player);
        });
        setTimeout(() => this.gameBoard.draw(this.game), 5);
    }
}
