import {HTMLComponent} from "/js/component.js";
import {Player} from "/js/player.js";
import {Game} from "/js/game.js";

export class Replay extends HTMLComponent {
    #gameReplayInterval = 500;

    /** @type {{players: {}, initialGrid: number[][], gameActions: {}[][], timeElapsed: number, date: string, winner: string}} */ #gameData;
    /** @type {Game} */ game;
    flipped;

    static get observedAttributes() {
        return ["flipped"];
    }

    constructor() {
        super("replay", ["html", "css"]);
    }

    set gameData(data) {
        this.#gameData = data;
        this.updateDisplay();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        this.updateDisplay();
    }

    onSetupCompleted = () => {
        this.gameBoard = this.shadowRoot.getElementById("board");
        this.boardRange = this.shadowRoot.getElementById("board-range");
        this.boardRange.addEventListener("input", () => this.#drawTillTurn(this.boardRange.value));

        this.playPauseBtn = this.shadowRoot.getElementById("play-pause");
        this.playPauseBtnImg = this.playPauseBtn.querySelector("img");
        this.playPauseBtn.addEventListener("click", () => {
            if (this.playPauseBtn.classList.toggle("playing")) {
                if (this.boardRange.value >= this.#gameData.gameActions.length - 1) {
                    this.#clearReplay();
                    this.boardRange.value = 0;
                } else this.boardRange.value = Math.min(parseInt(this.boardRange.value) + 1, this.#gameData.gameActions.length - 1);
                this.#playTillEnd();
                this.playPauseBtnImg.src = "/assets/pause.svg";
            } else {
                clearInterval(this.replayTimer);
                this.replayTimer = null;
                this.playPauseBtnImg.src = "/assets/play.svg";
            }
        });

        this.shadowRoot.getElementById("previous-btn").addEventListener("click", () => {
            if (this.boardRange.value <= 0) return;
            this.#handleReplayControls(-1);
        });

        this.shadowRoot.getElementById("next-btn").addEventListener("click", () => {
            if (this.boardRange.value >= this.#gameData.gameActions.length - 1) return;
            this.#handleReplayControls(1);
        });

        this.updateDisplay();
    };

    onHidden = () => {
        if (!this.replayTimer) return;
        clearInterval(this.replayTimer);
        this.replayTimer = null;
        this.playPauseBtnImg.src = "/assets/play.svg";
        this.playPauseBtn.classList.remove("playing");
    };

    updateDisplay() {
        if (!this.#gameData || !this.boardRange) return;
        this.boardRange.max = this.#gameData.gameActions.length - 1;
        const players = (this.flipped === "true" ? this.#gameData.players.toReversed() : this.#gameData.players).map(player => new Player(player.name, player.color, player.avatar));
        players.forEach((player, i) => player.init(i + 1, this.#gameData.gameActions[0]));
        this.game = new Game(16, 9, players[0], players[1], 500);
        this.#drawTillTurn(0);
    }

    #clearReplay() {
        this.game.grid = structuredClone(this.#gameData.initialGrid);
    }

    #handleReplayControls(step) {
        clearInterval(this.replayTimer);
        this.replayTimer = null;
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
            if (++this.boardRange.value >= this.#gameData.gameActions.length) {
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
        this.replayTimer = null;
        this.playPauseBtnImg.src = "/assets/play.svg";
        if (this.playPauseBtn.classList.contains("playing")) this.playPauseBtn.classList.remove("playing");
        this.#clearReplay();
        for (let i = 0; i <= turn; i++) this.#renderGameState(i);
    }

    #renderGameState(turnIndex) {
        if (!this.#gameData.gameActions || turnIndex >= this.#gameData.gameActions.length) return;
        this.game.setPlayerStates(this.#gameData.gameActions[turnIndex], this.flipped === "true");
        if (turnIndex > 0) this.game.players.forEach(player => this.game.updateGrid(player));
        setTimeout(() => this.gameBoard.draw(this.game), 5);
    }
}
