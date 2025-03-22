import {HTMLComponent} from "/js/component.js";
import {getUserInfo} from "/js/login-manager.js";

export class ProfilePage extends HTMLComponent {
    constructor() {
        super("profile-page", ["html", "css"]);
    }

    onSetupCompleted = async () => {
        this.profilePage = this.shadowRoot.getElementById("profile-page");
        this.overview = this.shadowRoot.getElementById("overview");
        this.history = this.shadowRoot.getElementById("history");
        this.leaderboard = this.shadowRoot.getElementById("leaderboard");
        this.notFound = this.shadowRoot.getElementById("not-found-message");

        const userName = new URLSearchParams(location.search).get("username");
        const loggedUser = getUserInfo()?.username ?? null;
        const response = await fetch(`/api/game/stats/${userName}`);

        if (!userName && loggedUser)
            window.location.href = `?username=${loggedUser}#profile`;
        else if (response.status === 404) {
            this.profilePage.classList.toggle("not-found");
            this.notFound.innerHTML = `The user "${userName}" does not exist or has deleted their account.`;
        } else {
            const stats = await response.json();
            stats.username = userName;
            stats.loggedusername = loggedUser;
            if (stats) this.overview.setAttribute("stats", JSON.stringify(stats));
        }
    };
}
