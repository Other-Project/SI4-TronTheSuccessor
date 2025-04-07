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
        this.loadingSpinner = this.shadowRoot.getElementById("loading-spinner");
        this.addEventListener("scroll", this.handleScroll);
    };

    onVisible = async () => {
        this.gamesCache = [];
        this.hasMore = true;
        this.gameResultsContainer.innerHTML = "";
        this.oldestGameDate = null;
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
        this.loadingSpinner.classList.add("show");

        try {
            /*const response = await fetchApi(`/api/game/history?`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    from: this.oldestGameDate,
                    limit: this.limit
                })
            });*/
            const response = await fetchApi(`/api/game/history?limit=${this.limit}&from=${this.oldestGameDate}`);

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
            this.loadingSpinner.classList.remove("show");
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
