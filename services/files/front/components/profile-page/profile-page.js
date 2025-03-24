import {HTMLComponent} from "/js/component.js";
import {getUserInfo} from "/js/login-manager.js";

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
    };

    onVisible = async () => {
        const userName = new URLSearchParams(location.search).get("username");
        const loggedUser = getUserInfo()?.username ?? null;
        const response = await fetch(`/api/game/stats/${userName}`);

        if (!userName && loggedUser)
            window.location.href = `?username=${loggedUser}#profile`;
        else if (response.status === 404) {
            this.profilePage.classList.toggle("not-found");
            this.notFoundUser.textContent = userName;
        } else {
            const stats = await response.json();
            stats.username = userName;
            stats.loggedusername = loggedUser;
            if (stats) this.overview.setAttribute("stats", JSON.stringify(stats));
        }
    };
}
