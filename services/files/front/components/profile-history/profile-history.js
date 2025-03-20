import {HTMLComponent} from "/js/component.js";
import {fetchApi, getUserInfo} from "/js/login-manager.js";

export class ProfileHistory extends HTMLComponent {

    constructor() {
        super("profile-history", ["html", "css"]);
    }

    onVisible = async () => {
        await this.#getUserHistory();
    };

    async #getUserHistory() {
        const user = getUserInfo();
        if (user) {
            const response = await fetchApi("/api/game/history/" + user.username, null);
            const data = await response.json();
            const gameResultsContainer = this.shadowRoot.querySelector(".game-results-container");
            gameResultsContainer.innerHTML = "";
            for (const game of data.toReversed()) {
                const gameResult = document.createElement("app-game-result");
                gameResult.gameData = game;
                gameResultsContainer.appendChild(gameResult);
            }
        }
    }
}
