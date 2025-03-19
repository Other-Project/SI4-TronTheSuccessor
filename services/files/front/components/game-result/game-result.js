import {HTMLComponent} from "/js/component.js";

export class GameResult extends HTMLComponent {
    #gameData;

    constructor() {
        super("game-result", ["html", "css"]);
    }

    set gameData(data) {
        this.#gameData = data;
        if (this.isInitialized)
            this.updateDisplay();
    }

    onSetupCompleted = () => {
        if (this.#gameData) {
            this.updateDisplay();
        }
    };

    updateDisplay() {
        const statusElement = this.shadowRoot.querySelector(".status");
        const opponentElement = this.shadowRoot.querySelector(".opponent");
        const gameLengthValue = this.shadowRoot.querySelector(".game-length-value");
        const dateElement = this.shadowRoot.querySelector(".date");

        console.log("Game data", this.#gameData);
        const opponent = this.#gameData.opponentId;

        const result = !this.#gameData.winner ? this.#gameData.winner === false ? "Defeat" : "Draw" : "Victory";
        statusElement.textContent = result;
        statusElement.className = "status " + result.toLowerCase();

        opponentElement.textContent = opponent;
        gameLengthValue.textContent = this.formatGameLength(this.#gameData.timeElapsed);
        dateElement.textContent = new Date(this.#gameData.date).toLocaleDateString();
    }

    formatGameLength(durationInMsSeconds) {
        const seconds = Math.floor(durationInMsSeconds / 1000);
        const ms = durationInMsSeconds % 1000;
        return `${seconds}s ${ms}ms`;
    }
}
