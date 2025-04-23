import {HTMLComponent} from "/js/component.js";

export class ProfileLeaderboard extends HTMLComponent {
    constructor() {
        super("profile-leaderboard", ["html", "css"]);
    }

    static get observedAttributes() {
        return ["stats"];
    }

    onSetupCompleted = () => {
        this.leaderboard = this.shadowRoot.getElementById("profile-leaderboard");
        this.rankListing = this.shadowRoot.getElementById("rank-listing");
        this.profileRanking = this.shadowRoot.getElementById("profile-ranking");
    };

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (name === "stats") this.stats = JSON.parse(newValue);
        this.#refresh();
    }

    onVisible = () => this.#refresh();

    #refresh() {
        if (!this.leaderboard || !this.stats) return;
        this.rankListing.setAttribute("rank-listing", JSON.stringify(this.stats.topPlayers));
        this.profileRanking.setAttribute("stats", JSON.stringify(this.stats));
    }
}
