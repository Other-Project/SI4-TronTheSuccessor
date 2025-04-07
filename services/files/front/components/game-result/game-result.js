import {HTMLComponent} from "/js/component.js";
import {changePage} from "/components/pages/pages.js";
import {getUserInfo} from "/js/login-manager.js";

export class GameResult extends HTMLComponent {
    /** @type {{players: {}, initialGrid: number[][], gameActions: {}[][], timeElapsed: number, date: string, winner: string}} */ #gameData;

    constructor() {
        super("game-result", ["html", "css"]);
    }

    set gameData(data) {
        this.#gameData = data;
        this.updateDisplay();
    }

    onSetupCompleted = () => {
        this.replay = this.shadowRoot.getElementById("replay");
        this.container = this.shadowRoot.getElementById("container");
        this.shadowRoot.getElementById("game-result").addEventListener("click", () => {
            if (this.container.classList.contains("show")) {
                this.container.classList.add("hide-replay");

                setTimeout(() => {
                    this.container.classList.remove("show");
                    this.container.classList.remove("hide-replay");
                }, 500);
            } else
                this.container.classList.add("show");
        });

        this.statusElement = this.shadowRoot.querySelector(".status");
        this.opponentElement = this.shadowRoot.querySelector(".opponent");
        this.gameLengthValue = this.shadowRoot.querySelector(".game-length-value");
        this.dateElement = this.shadowRoot.querySelector(".date");

        this.updateDisplay();
    };

    updateDisplay() {
        if (!this.#gameData || !this.replay) return;

        const username = getUserInfo()?.username;
        if (!username) {
            console.error("User is not logged in");
            return;
        }

        const result = !this.#gameData.winner ? "Draw" : this.#gameData.winner === username ? "Victory" : "Defeat";
        this.statusElement.textContent = result;
        this.statusElement.className = "status " + result.toLowerCase();

        this.opponentElement.innerHTML = "";
        let first = true;
        for (let player of this.#gameData.players) {
            if (player.name === username) continue;
            if (!first) this.opponentElement.appendChild(document.createTextNode(", "));
            const playerSpan = document.createElement("span");
            playerSpan.textContent = player.name;
            playerSpan.classList.toggle("real-player", !player.bot);
            if (!player.bot) playerSpan.onclick = () => changePage(`/profile/${player.name}`);
            this.opponentElement.appendChild(playerSpan);
            first = false;
        }

        this.gameLengthValue.textContent = this.formatGameLength(this.#gameData.timeElapsed);
        this.dateElement.textContent = this.formatDate(this.#gameData.date);
        this.replay.gameData = this.#gameData;
        this.replay.setAttribute("flipped", this.#gameData.players[0].name !== username);
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
