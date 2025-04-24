import {HTMLComponent} from "/js/component.js";
import {fetchApi, getUserInfo} from "/js/login-manager.js";
import {changePage} from "/components/pages/pages.js";
import notificationService from "/js/notification.js";
import "/js/capacitor.min.js";

export class ProfilePage extends HTMLComponent {
    constructor() {
        super("profile-page", ["html", "css"], "profile");
    }

    onSetupCompleted = () => {
        this.profilePage = this.shadowRoot.getElementById("profile-page");
        this.profileStats = this.shadowRoot.getElementById("stats");
        this.profileStatsTab = this.shadowRoot.getElementById("stats-tab");
        this.history = this.shadowRoot.getElementById("history");
        this.leaderboard = this.shadowRoot.getElementById("leaderboard");
        this.notFoundUser = this.shadowRoot.getElementById("not-found-user");

        this.userInfo = this.shadowRoot.getElementById("userinfo");
        this.tabNavigation = this.shadowRoot.getElementById("tab-navigation");

        this.shadowRoot.getElementById("home-page").addEventListener("click", () => changePage("/"));

        this.actionButtons = this.shadowRoot.getElementById("action-buttons");
        this.share = this.shadowRoot.getElementById("share");
        this.share.addEventListener("click", () => {
            if (Capacitor.isNativePlatform())
                Capacitor.Plugins.Share.share({
                    title: "Tron: The Successor",
                    text: "I want to share this Tron: The Successor profile with you.",
                    url: new URL(location.pathname, "https://tronsuccessor.ps8.pns.academy").toString(),
                    dialogTitle: "Share this profile"
                });
            else navigator.clipboard.writeText(location.href)
                .then(() => this.#showNotification("Profile URL copied to clipboard!", 2000, "#8E24AA", "white"));
        });

        this.addFriend = this.shadowRoot.getElementById("add-friend");
        this.removeFriend = this.shadowRoot.getElementById("remove-friend");
        this.addFriend.addEventListener("click", async () => await this.#manageFriend(this.stats.username, true));
        this.removeFriend.addEventListener("click", async () => await this.#manageFriend(this.stats.username, false));
        notificationService.addEventListener("refresh-friend-list", async () => await this.#refresh());

        window.addEventListener("resize", () => this.profileStatsTab.dataset.tabDisabled = (window.innerWidth > window.innerHeight).toString(), true);
        this.profileStatsTab.dataset.tabDisabled = (window.innerWidth > window.innerHeight).toString();
    };

    onVisible = () => this.#refresh().then();

    async #getStatus(username) {
        if (username === this.stats.loggedusername) return {isYou: true, isFriend: false, isPending: false};
        const response = await fetchApi("/api/user/friends", {method: "GET"});
        const friends = response.ok ? await response.json() : null;
        return {
            isYou: false,
            isFriend: friends?.friends?.includes(username) ?? false,
            isPending: friends?.pending?.includes(username) ?? false
        };
    };

    async #refresh() {
        const urlPath = window.location.pathname.split("/");
        if (urlPath[1] !== "profile") return;
        let userName = urlPath[2];
        const loggedUser = getUserInfo()?.username ?? null;
        if (!userName && loggedUser) {
            changePage(`/profile/${loggedUser}`, true);
            userName = loggedUser;
        }
        if (!userName) {
            changePage("/", true);
            return;
        }


        this.actionButtons.classList.toggle("hidden", true);

        const response = await fetchApi(`/api/game/stats/${userName}`, undefined, false);
        this.profilePage.classList.toggle("not-found", !response.ok);
        this.notFoundUser.textContent = userName;
        if (!response.ok) return;

        this.stats = await response.json();
        this.stats.username = userName;
        this.stats.loggedusername = loggedUser;
        this.userInfo.setAttribute("stats", JSON.stringify(this.stats));
        this.leaderboard.setAttribute("stats", JSON.stringify(this.stats));

        for (let profStats of [this.profileStats, this.profileStatsTab]) {
            profStats.setAttribute("games", this.stats.games);
            profStats.setAttribute("time", this.stats.timePlayed);
            profStats.setAttribute("streak", this.stats.winStreak);
            const totalGames = this.stats.games - this.stats.draws;
            if (totalGames === 0) this.profileStats.setAttribute("winrate", "-");
            else profStats.setAttribute("winrate", Math.round(this.stats.wins * 100 / totalGames));
        }


        const {isYou, isFriend, isPending} = await this.#getStatus(this.stats.username);
        this.history.dataset.tabDisabled = (!isYou).toString();
        this.share.classList.toggle("hidden", false);
        this.addFriend.classList.toggle("hidden", isYou || isFriend);
        this.removeFriend.classList.toggle("hidden", isYou || isPending || !isFriend);
        this.addFriend.button.disabled = isPending;
        this.addFriend.title = isPending ? "Friend request already sent" : "";

        if (!this.tabNavigation.changeTab("stats-tab")) this.tabNavigation.changeTab("leaderboard");
        this.actionButtons.classList.toggle("hidden", false);
    }

    async #manageFriend(friend, add) {
        const response = await fetchApi(`/api/user/friends/${friend}`, {
            method: add ? "POST" : "DELETE"
        });
        if (response.ok) {
            if (add) this.#showNotification("Friend request sent!", 2000, "#8E24AA", "white");
            else this.#showNotification("Friend removed", 2000, "#8E24AA", "white");
        } else {
            const error = await response.json();
            this.#showNotification(`Error: ${error.error}`, 2000, "red", "white");
        }
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
}
