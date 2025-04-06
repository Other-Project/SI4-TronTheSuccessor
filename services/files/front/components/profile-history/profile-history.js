import {HTMLComponent} from "/js/component.js";
import {fetchApi, getUserInfo} from "/js/login-manager.js";

export class ProfileHistory extends HTMLComponent {
    /** @type {Array} */
    gamesCache = [];
    offset = 0;
    limit = 10;
    isLoading = false;
    hasMore = true;

    constructor() {
        super("profile-history", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.gameResultsContainer = this.shadowRoot.querySelector(".game-results-container");
        this.addEventListener("scroll", this.handleScroll);
    };

    onVisible = async () => {
        this.gamesCache = [];
        this.offset = 0;
        this.hasMore = true;
        this.gameResultsContainer.innerHTML = "";
        await this.loadNextPage();
    };

    handleScroll = async () => {
        const {scrollTop, scrollHeight, clientHeight} = this;
        if (scrollTop + clientHeight >= scrollHeight - 100 && this.hasMore && !this.isLoading) {
            await this.loadNextPage();
        }
    };

    async loadNextPage() {
        const user = getUserInfo();
        if (!user) return;
        this.isLoading = true;

        const response = await fetchApi(`/api/game/history`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                offset: this.offset,
                limit: this.limit
            })
        });
        const data = await response.json();

        this.gamesCache = this.gamesCache.concat(data);
        this.renderGamesAppend(data);

        if (data.length < this.limit)
            this.hasMore = false;
        else
            this.offset += this.limit;
        this.isLoading = false;
    }

    renderGamesAppend(data) {
        if (this.gamesCache.length === 0 && data.length === 0) {
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
