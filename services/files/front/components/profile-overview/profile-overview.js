import {HTMLComponent} from "/js/component.js";
import {getCookie} from "../../js/login-manager.js";
import {parseJwt} from "../../components/login/login.js";

export class ProfileOverview extends HTMLComponent {
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

    async #sendFriendRequest(currentUser, friend, token) {
        await fetch(`/api/user/friends/add`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                friends: friend,
            })
        });
        this.#showNotification("Friend request sent!", 2000, "#8E24AA", "white");
    }

    onSetupCompleted = async () => {
        const userName = location.search.split("=")[1];
        const response = await fetch(`/api/game/stats/${userName}`);
        const token = getCookie("accessToken");

        let jwt;
        if (token !== "") jwt = parseJwt(token);
        if (jwt && jwt.username === userName)
            this.shadowRoot.querySelectorAll('app-button').forEach(button => button.classList.toggle("hidden"));

        this.rank = this.shadowRoot.getElementById("profile-rank");
        this.profileStats = this.shadowRoot.getElementById("profiles-stats");
        this.profilePfp = this.shadowRoot.getElementById("profile-pfp");

        if (response.status === 404) {
            this.shadowRoot.innerHTML = `<h1 class=not-found>${userName} does not exist or has deleted his account</h1>`;
            return;
        } else {
            const stats = await response.json();
            stats.username = userName;
            if (stats) this.#updateProfile(stats);
        }

        this.shadowRoot.getElementById("modify-password").addEventListener("click", () => {
            document.dispatchEvent(new CustomEvent("menu-selection", {detail: "modify-password"}));
        });
        this.shadowRoot.getElementById("share").addEventListener("click", () => {
            navigator.clipboard.writeText(location.href).then(() => {
                this.#showNotification("Profile URL copied to clipboard!", 2000, "#8E24AA", "white");
            });
        });
        this.shadowRoot.getElementById("add-friend").addEventListener("click", async () => {
            if (!token) {
                localStorage.setItem("redirectAfterLogin", window.location.href);
                window.location.href = "#login";
            } else await this.#sendFriendRequest(jwt.username, userName, token);
        });
    };

    #updateProfile(stats) {
        this.profilePfp.setAttribute("src", "../../assets/profil.svg");
        this.profilePfp.setAttribute("username", stats.username);
        this.rank.setAttribute("Rank", stats.rank);
        this.rank.setAttribute("points", stats.eloInRank);
        this.profileStats.setAttribute("games", stats.games);
        this.profileStats.setAttribute("time", Math.round(stats.timePlayed / 60));
        this.profileStats.setAttribute("streak", stats.winStreak);
        const totalGames = stats.games - stats.draws;
        if (totalGames === 0) this.profileStats.setAttribute("winrate", "-");
        else this.profileStats.setAttribute("winrate", Math.round((stats.wins * 100 / totalGames)));
    }
}
