import {HTMLComponent} from "/js/component.js";
import {fetchApi, getUserInfo} from "/js/login-manager.js";

export class ProfileHistory extends HTMLComponent {
    /** @type {Array} */
    gamesCache = [];
    limit = 10;
    oldestGameDate = null;
    isLoading = false;
    hasMore = true;

    constructor() {
        super("profile-history", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.gameResultsContainer = this.shadowRoot.querySelector(".game-results-container");
        this.loadingSpinner = this.shadowRoot.querySelector(".loading-spinner");
        this.addEventListener("scroll", this.handleScroll);
    };

    onVisible = async () => {
        this.gamesCache = [];
        this.hasMore = true;
        this.gameResultsContainer.innerHTML = "";
        await this.loadNextPage();
    };

    handleScroll = async () => {
        const {scrollTop, scrollHeight, clientHeight} = this;
        if (scrollTop + clientHeight >= scrollHeight && this.hasMore && !this.isLoading) {
            await this.loadNextPage();
        }
    };

    async loadNextPage() {
        const user = getUserInfo();
        if (!user) return;

        this.isLoading = true;
        this.loadingSpinner.style.display = "flex";

        try {
            const response = await fetchApi(`/api/game/history`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    from: this.oldestGameDate,
                    limit: this.limit
                })
            });

            const data = await response.json();
            this.gamesCache = this.gamesCache.concat(data);
            this.renderGamesAppend(data);

            if (data.length < this.limit)
                this.hasMore = false;
        } catch (error) {
            document.dispatchEvent(new CustomEvent("show-notification", {
                detail: {
                    message: "Error loading game history",
                    duration: 2000,
                    background: "red",
                    color: "white"
                }
            }));
        } finally {
            this.isLoading = false;
            this.loadingSpinner.style.display = "none";
        }
    }

    renderGamesAppend(data) {
        if (this.gamesCache.length === 0 && data.length === 0) {
            this.gameResultsContainer.innerHTML = "No game played yet.";
            this.gameResultsContainer.style.textAlign = "center";
            this.gameResultsContainer.style.fontSize = "1.5em";
            return;
        }
        for (const game of data) {
            if (this.oldestGameDate === null || new Date(game.date) < new Date(this.oldestGameDate)) {
                this.oldestGameDate = game.date;
            }
            const gameResult = document.createElement("app-game-result");
            gameResult.gameData = game;
            this.gameResultsContainer.appendChild(gameResult);
        }
    }
}
