import {HTMLComponent} from "/js/component.js";

export class GameResult extends HTMLComponent {
    #gameData;

    constructor() {
        super("game-result", ["html", "css"]);
    }

    set gameData(data) {
        this.#gameData = data;
    }

    onSetupCompleted = () => {
        this.gameBoard = this.shadowRoot.getElementById("board");
        this.replay = this.shadowRoot.getElementById("replay");
        this.shadowRoot.getElementById("game-result").addEventListener("click", () => {
            this.replay.classList.toggle("show");
        });

        this.statusElement = this.shadowRoot.querySelector(".status");
        this.opponentElement = this.shadowRoot.querySelector(".opponent");
        this.gameLengthValue = this.shadowRoot.querySelector(".game-length-value");
        this.dateElement = this.shadowRoot.querySelector(".date");
        if (this.#gameData)
            this.updateDisplay();
    };

    updateDisplay() {
        const result = !this.#gameData.winner ? "Draw" : this.#gameData.winner === this.#gameData.opponentName ? "Defeat" : "Victory";

        this.statusElement.textContent = result;
        this.statusElement.className = "status " + result.toLowerCase();

        this.opponentElement.textContent = this.#gameData.opponentName;
        this.gameLengthValue.textContent = this.formatGameLength(this.#gameData.timeElapsed);
        this.dateElement.textContent = this.formatDate(this.#gameData.date);
        this.replay.gameData = this.#gameData;
    }

    formatDate(dateString) {
        const date = new Date(dateString);

        const dateFormatted = date.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });

        const timeFormatted = date.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });

        return `${dateFormatted}\n${timeFormatted}`;
    }

    formatGameLength(durationInMsSeconds) {
        const seconds = Math.floor(durationInMsSeconds / 1000);
        const ms = durationInMsSeconds % 1000;
        return `${seconds}s ${ms}ms`;
    }
}
