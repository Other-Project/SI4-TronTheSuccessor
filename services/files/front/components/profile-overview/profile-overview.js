import {HTMLComponent} from "/js/component.js";
import {fetchApi} from "/js/login-manager.js";

export class ProfileOverview extends HTMLComponent {
    static get observedAttributes() {
        return ["stats"];
    }

    constructor() {
        super("profile-overview", ["html", "css"]);
    }

    #showNotification(message, duration, background, color) {
        const notification = document.createElement("app-notification");
        notification.message = message;
        notification.duration = duration;
        notification.background = background;
        notification.color = color;
        this.shadowRoot.appendChild(notification);
        notification.show();
    }

    async #sendFriendRequest(friend) {
        const response = await fetchApi(`/api/user/friends/send`, {
            method: "POST",
            body: JSON.stringify({
                friends: friend,
            })
        });

        if (response.ok)
            this.#showNotification("Friend request sent!", 2000, "#8E24AA", "white");
        else {
            const error = await response.json();
            this.#showNotification(`Error: ${error.error}`, 2000, "red", "white");
        }
    }

    onSetupCompleted = async () => {
        this.rank = this.shadowRoot.getElementById("profile-rank");
        this.profileStats = this.shadowRoot.getElementById("profiles-stats");
        this.profilePfp = this.shadowRoot.getElementById("profile-pfp");

        this.shadowRoot.getElementById("modify-password").addEventListener("click", () => {
            document.dispatchEvent(new CustomEvent("menu-selection", {detail: "modify-password"}));
        });
        this.shadowRoot.getElementById("share").addEventListener("click", () => {
            navigator.clipboard.writeText(location.href).then(() => {
                this.#showNotification("Profile URL copied to clipboard!", 2000, "#8E24AA", "white");
            });
        });
    };

    onVisible = () => this.#refresh();

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        this.#refresh();
    }

    #refresh() {
        if (!this.rank) return;
        this.stats = JSON.parse(this.stats);

        if (this.stats.loggedusername && this.stats.loggedusername === this.stats.username)
            this.shadowRoot.querySelectorAll('app-button').forEach(button => button.classList.toggle("hidden"));
        this.shadowRoot.getElementById("add-friend").addEventListener("click", async () => {
            if (!this.stats.loggedusername) {
                localStorage.setItem("redirectAfterLogin", window.location.href);
                window.location.href = "#login";
            } else await this.#sendFriendRequest(this.stats.username);
        });

        this.profilePfp.setAttribute("src", "../../assets/profile.svg");
        this.profilePfp.setAttribute("username", this.stats.username);
        this.rank.setAttribute("Rank", this.stats.rank);
        this.rank.setAttribute("points", this.stats.eloInRank);
        this.profileStats.setAttribute("games", this.stats.games);
        this.profileStats.setAttribute("time", Math.round(this.stats.timePlayed / 60));
        this.profileStats.setAttribute("streak", this.stats.winStreak);
        const totalGames = this.stats.games - this.stats.draws;
        if (totalGames === 0) this.profileStats.setAttribute("winrate", "-");
        else this.profileStats.setAttribute("winrate", Math.round((this.stats.wins * 100 / totalGames)));
    }
}
