import {HTMLComponent} from "/js/component.js";

export class ProfileStats extends HTMLComponent {
    games;
    winrate;
    time;
    streak;

    constructor() {
        super("profile-stats", ["html", "css"]);
    }

    onSetupCompleted = () => {
        const template = document.getElementById("stats-template").content.cloneNode(true);
        this.shadowRoot.appendChild(template);

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
        this.elements.games.textContent = this.getAttribute("games") || "0";
        this.elements.winrate.textContent = `${this.getAttribute("winrate") || "0"}%`;
        this.elements.time.textContent = this.getAttribute("time") || "0h";
        this.elements.streak.textContent = this.getAttribute("streak") || "0";
    }
}
