import {HTMLComponent} from "/js/component.js";
import {getUserInfo} from "/js/login-manager.js";
import {changePage} from "/components/pages/pages.js";

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
    };

    onVisible = async () => {
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

        this.usernameElement.textContent = userName;
        const response = await fetch(`/api/game/stats/${userName}`);
        this.profilePage.classList.toggle("not-found", !response.ok);
        this.notFoundUser.textContent = userName;
        if (!response.ok) return;

        const stats = await response.json();
        stats.username = userName;
        stats.loggedusername = loggedUser;
        if (stats) {
            this.overview.setAttribute("stats", JSON.stringify(stats));
            this.leaderboard.setAttribute("stats", JSON.stringify(stats));
        }
        this.tabNavigation.changeTab("overview");
        this.history.dataset.tabDisabled = userName === loggedUser ? "false" : "true";
    };
}
