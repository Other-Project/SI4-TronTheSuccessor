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
        this.rankRepartition = this.shadowRoot.getElementById("rank-repartition");
        this.rank = this.shadowRoot.getElementById("rank");
    };

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (name === "stats") this.stats = JSON.parse(newValue);
        this.#refresh();
    }

    onVisible = () => this.#refresh();

    #refresh() {
        if (!this.leaderboard || !this.stats) return;
        this.rankRepartition.setAttribute("stats", JSON.stringify(this.stats));
        this.rank.setAttribute("rank", this.stats.rank);
        this.rank.setAttribute("points", this.stats.eloInRank);
        this.rank.setAttribute("baserank", this.stats.baseRank);
        this.rank.setAttribute("height", "250");
    }
}
