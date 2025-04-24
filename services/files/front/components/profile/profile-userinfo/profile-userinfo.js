import {HTMLComponent} from "/js/component.js";
import notificationService from "/js/notification.js";
import {fetchApi} from "/js/login-manager.js";

export class ProfileUserInfo extends HTMLComponent {
    stats;

    static get observedAttributes() {
        return ["stats"];
    }

    constructor() {
        super("profile-userinfo", ["html", "css"], "profile");
    }

    async attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (name === "stats") this.stats = JSON.parse(newValue);
        await this.#refresh();
    }

    onSetupCompleted = async () => {
        this.usernameElement = this.shadowRoot.getElementById("username");
        this.rankIcon = this.shadowRoot.getElementById("rank-icon");
        this.eloValue = this.shadowRoot.getElementById("elo-value");
        this.rankProgress = this.shadowRoot.getElementById("rank-progress");
        this.rankCurrent = this.shadowRoot.getElementById("rank-from");
        this.rankNext = this.shadowRoot.getElementById("rank-to");
        this.status = this.shadowRoot.getElementById("status-indicator");

        await this.#refresh();
    };

    async #refresh() {
        if (!this.stats || !this.usernameElement) return;
        this.usernameElement.textContent = this.stats.username;
        this.rankIcon.setAttribute("rank", this.stats.baseRank.toLowerCase());
        this.eloValue.textContent = this.stats.elo.toFixed(0);

        const ranks = Object.keys(this.stats.rankDistribution);
        const nextRank = ranks[ranks.indexOf(this.stats.rank) + 1];
        this.rankProgress.style.width = `${nextRank ? this.stats.eloInRank : 100}%`;
        this.rankProgress.classList.toggle("rank-progress-unlimited", !nextRank);
        this.rankCurrent.textContent = this.stats.rank;
        this.rankNext.textContent = nextRank ?? "";
        await fetchApi("/api/user/friends/" + this.stats.username + "/status").then(response => {
            if (response.ok) return response.json();
        }).then(status => {
            if (!status || !status.isFriend) return;
            this.status.classList.add("show");
            this.status.classList.toggle("connected", notificationService.getConnectedFriends().includes(this.stats.username));
        });
    }
}
