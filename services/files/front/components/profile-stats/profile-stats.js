import {HTMLComponent} from "/js/component.js";

export class ProfileStats extends HTMLComponent {
    constructor() {
        super("profile-stats", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.games = this.shadowRoot.getElementById("games");
        this.winrate = this.shadowRoot.getElementById("winrate");
        this.time = this.shadowRoot.getElementById("time");
        this.streak = this.shadowRoot.getElementById("streak");
        this.#updateStats();
    };

    static get observedAttributes() {
        return ["games", "winrate", "time", "streak"];
    }

    attributeChangedCallback() {
        this.#updateStats();
    }

    #updateStats() {
        if (!this.games || !this.winrate || !this.time || !this.streak) return;

        this.games.textContent = this.getAttribute("games") || "10";
        this.winrate.textContent = `${this.getAttribute("winrate") || "50"}%`;
        this.time.textContent = this.getAttribute("time") || "5h";
        this.streak.textContent = this.getAttribute("streak") || "3";
    }
}
