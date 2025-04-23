import {HTMLComponent} from "/js/component.js";

export class ProfileRanking extends HTMLComponent {
    constructor() {
        super("profile-ranking", ["html", "css"]);
    }

    static get observedAttributes() {
        return ["stats"];
    }

    onSetupCompleted = () => {
        this.rank = this.shadowRoot.getElementById("rank");
        this.rankRepartition = this.shadowRoot.getElementById("rank-repartition");
        this.profileRanking = this.shadowRoot.getElementById("profile-ranking");
    };

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        console.log("attributeChangedCallback", name, oldValue, newValue);
        if (name === "stats") this.stats = JSON.parse(newValue);
        this.#refresh();
    }

    #refresh() {
        if (!this.stats) return;
        this.rankRepartition.setAttribute("stats", JSON.stringify(this.stats));
        this.rank.setAttribute("rank", this.stats.rank);
        this.rank.setAttribute("points", this.stats.eloInRank);
        this.rank.setAttribute("baserank", this.stats.baseRank);
        this.rank.setAttribute("height", "100");
    }
}
