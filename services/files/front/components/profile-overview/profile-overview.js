import {HTMLComponent} from "/js/component.js";
import {fetchApi} from "/js/login-manager.js";

export class ProfileOverview extends HTMLComponent {
    constructor() {
        super("profile-overview", ["html", "css"]);
    }

    static get observedAttributes() {
        return ["stats"];
    }

    onVisible = async () => {
        this.friends = await this.#getFriends();
        this.#refresh();
    };

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (name === "stats") this.stats = JSON.parse(newValue);
        this.#refresh();
    }

    #showNotification(message, duration, background, color) {
        document.dispatchEvent(new CustomEvent("show-notification", {
            detail: {
                message: message,
                duration: duration,
                background: background,
                color: color
            }
        }));
    }

    async #manageFriend(friend, action) {
        const response = await fetchApi(`/api/user/friends/${friend}`, {
            method: action === "add" ? "POST" : "DELETE",
        });
        if (response.ok) {
            if (action === "add") {
                this.addFriend.button.disabled = true;
                this.addFriend.title = "Friend request already sent";
                this.#showNotification("Friend request sent!", 2000, "#8E24AA", "white");
            } else {
                this.buttons.classList.toggle("add");
                this.#showNotification("Friend removed", 2000, "#8E24AA", "white");
            }
        } else {
            const error = await response.json();
            this.#showNotification(`Error: ${error.error}`, 2000, "red", "white");
        }
    }

    onSetupCompleted = () => {
        this.rank = this.shadowRoot.getElementById("profile-rank");
        this.profileStats = this.shadowRoot.getElementById("profiles-stats");
        this.profilePfp = this.shadowRoot.getElementById("profile-pfp");
        this.addFriend = this.shadowRoot.getElementById("add-friend");
        this.removeFriend = this.shadowRoot.getElementById("remove-friend");
        this.buttons = this.shadowRoot.getElementById("profile-buttons-container");

        this.shadowRoot.getElementById("modify-password").addEventListener("click", () => {
            // TODO: implement password change
        });
        this.shadowRoot.getElementById("share").addEventListener("click", () => {
            navigator.clipboard.writeText(location.href).then(() => {
                this.#showNotification("Profile URL copied to clipboard!", 2000, "#8E24AA", "white");
            });
        });
    };

    #getFriends = async () => {
        return await fetchApi("/api/user/friends", {method: "GET"}).then(response => response.json());
    };

    #refresh() {
        if (!this.rank) return;
        if (this.stats.loggedusername && this.stats.loggedusername === this.stats.username)
            this.buttons.classList.toggle("logged-in");

        if (!this.friends.friends.includes(this.stats.username))
            this.buttons.classList.toggle("add");

        this.addFriend.addEventListener("click", async () => {
            if (!this.stats.loggedusername) {
                // TODO: open login modal
            } else await this.#manageFriend(this.stats.username, "add");
        });
        this.removeFriend.addEventListener("click", async () => {
            await this.#manageFriend(this.stats.username, "remove");
        });

        this.profilePfp.setAttribute("src", "/assets/profile.svg");
        this.profilePfp.setAttribute("username", this.stats.username);
        this.rank.setAttribute("rank", this.stats.rank);
        this.rank.setAttribute("points", this.stats.eloInRank);
        this.rank.setAttribute("baserank", this.stats.baseRank);
        this.profileStats.setAttribute("games", this.stats.games);
        this.profileStats.setAttribute("time", this.stats.timePlayed);
        this.profileStats.setAttribute("streak", this.stats.winStreak);
        const totalGames = this.stats.games - this.stats.draws;
        if (totalGames === 0) this.profileStats.setAttribute("winrate", "-");
        else this.profileStats.setAttribute("winrate", Math.round((this.stats.wins * 100 / totalGames)));
    }
}
