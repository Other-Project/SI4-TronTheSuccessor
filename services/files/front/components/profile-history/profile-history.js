import {HTMLComponent} from "/js/component.js";
import {fetchApi, getUserInfo} from "/js/login-manager.js";

export class ProfileHistory extends HTMLComponent {

    constructor() {
        super("profile-history", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.gameResultsContainer = this.shadowRoot.querySelector(".game-results-container");
    };

    onVisible = async () => {
        await this.#getUserHistory();
    };

    async #getUserHistory() {
        const user = getUserInfo();
        if (!user) return;
        const response = await fetchApi("/api/game/history", null);
        const data = await response.json();
        this.gameResultsContainer.innerHTML = "";
        if (data.length === 0) {
            this.gameResultsContainer.innerHTML = "No game played yet.";
            this.gameResultsContainer.style.textAlign = "center";
            this.gameResultsContainer.style.fontSize = "1.5em";
            return;
        }
        for (const game of data) {
            const gameResult = document.createElement("app-game-result");
            gameResult.gameData = game;
            this.gameResultsContainer.appendChild(gameResult);
        }
    }
}
