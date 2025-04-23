import {HTMLComponent} from "/js/component.js";
import {fetchApi, getUserInfo} from "/js/login-manager.js";
import {changePage} from "/components/pages/pages.js";
import notificationService from "../../js/notification.js";
import "/js/capacitor.min.js";

export class ProfilePage extends HTMLComponent {
    constructor() {
        super("profile-page", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.profilePage = this.shadowRoot.getElementById("profile-page");
        this.overview = this.shadowRoot.getElementById("overview");
        this.history = this.shadowRoot.getElementById("history");
        this.leaderboard = this.shadowRoot.getElementById("leaderboard");
        this.notFoundUser = this.shadowRoot.getElementById("not-found-user");

        this.usernameElement = this.shadowRoot.getElementById("username");
        this.tabNavigation = this.shadowRoot.getElementById("tab-navigation");

        this.shadowRoot.getElementById("home-page").addEventListener("click", () => changePage("/"));

        this.share = this.shadowRoot.getElementById("share");
        this.share.addEventListener("click", () => {
            if (Capacitor.isNativePlatform())
                Capacitor.Plugins.Share.share({
                    title: "Tron: The Successor",
                    text: "I want to share this Tron: The Successor profile with you",
                    url: new URL("https://tronsuccessor.ps8.pns.academy", location.pathname).toString(),
                    dialogTitle: "Share this profile"
                });
            else navigator.clipboard.writeText(location.href)
                .then(() => this.#showNotification("Profile URL copied to clipboard!", 2000, "#8E24AA", "white"));
        });

        this.addFriend = this.shadowRoot.getElementById("add-friend");
        this.removeFriend = this.shadowRoot.getElementById("remove-friend");
        this.addFriend.addEventListener("click", async () => await this.#manageFriend(this.stats.username, "add"));
        this.removeFriend.addEventListener("click", async () => await this.#manageFriend(this.stats.username, "remove"));
        notificationService.addEventListener("refresh-friend-list", async () => await this.#refresh());
    };

    onVisible = () => this.#refresh().then();

    async #getStatus(username) {
        if (this.stats.username === this.stats.loggedusername) return {isYou: true, isFriend: false, isPending: false};
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

        this.share.classList.toggle("hidden", true);
        this.addFriend.classList.toggle("hidden", true);
        this.removeFriend.classList.toggle("hidden", true);

        this.usernameElement.textContent = userName;
        const response = await fetchApi(`/api/game/stats/${userName}`, undefined, false);
        this.profilePage.classList.toggle("not-found", !response.ok);
        this.notFoundUser.textContent = userName;
        if (!response.ok) return;

        this.stats = await response.json();
        this.stats.username = userName;
        this.stats.loggedusername = loggedUser;
        this.overview.setAttribute("stats", JSON.stringify(this.stats));
        this.leaderboard.setAttribute("stats", JSON.stringify(this.stats));
        this.history.dataset.tabDisabled = userName === loggedUser ? "false" : "true";
        this.tabNavigation.changeTab("overview");
        this.share.classList.toggle("hidden", false);

        const {isYou, isFriend, isPending} = await this.#getStatus(this.stats.username);
        this.addFriend.classList.toggle("hidden", isYou || isFriend);
        this.removeFriend.classList.toggle("hidden", isYou || isPending || !isFriend);
        this.addFriend.button.disabled = isPending;
        this.addFriend.title = isPending ? "Friend request already sent" : "";
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
