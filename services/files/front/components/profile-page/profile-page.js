import {HTMLComponent} from "/js/component.js";
import {getUserInfo} from "/js/login-manager.js";

export class ProfilePage extends HTMLComponent {
    constructor() {
        super("profile-page", ["html", "css"]);
    }

    onSetupCompleted = async () => {
        this.overview = this.shadowRoot.getElementById("overview");
        this.history = this.shadowRoot.getElementById("history");
        this.leaderboard = this.shadowRoot.getElementById("leaderboard");
        this.tab = this.shadowRoot.getElementById("tab-navigation");
        this.notFound = this.shadowRoot.getElementById("not-found");
        const userName = location.search.split("=")[1];
        const response = await fetch(`/api/game/stats/${userName}`);

        if (response.status === 404) {
            this.tab.remove();
            this.notFound.classList.toggle("hidden");
            this.notFound.innerHTML = `The user "${userName}" does not exist or has deleted their account.`;
        } else {
            const stats = await response.json();
            stats.username = userName;
            stats.loggedusername = getUserInfo()?.username ?? null;
            if (stats) this.overview.setAttribute("stats", JSON.stringify(stats));
        }
    };
}
