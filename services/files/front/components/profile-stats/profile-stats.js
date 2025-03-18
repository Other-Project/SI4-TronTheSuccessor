import {HTMLComponent} from "/js/component.js";

export class ProfileStats extends HTMLComponent {
    static get observedAttributes() {
        return ["games", "time", "streak", "winrate"];
    }

    constructor() {
        super("profile-stats", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.gamesElement = this.shadowRoot.getElementById("games");
        this.timeElement = this.shadowRoot.getElementById("time");
        this.streakElement = this.shadowRoot.getElementById("streak");
        this.winrateElement = this.shadowRoot.getElementById("winrate");
    }

    onVisible = () => this.#refresh();

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        this.#refresh();
    }

    #refresh() {
        if (!this.gamesElement) return;
        this.gamesElement.childNodes[0].textContent = this.games;
        this.timeElement.childNodes[0].textContent = this.time;
        this.streakElement.childNodes[0].textContent = this.streak;
        this.winrateElement.childNodes[0].textContent = this.winrate;
    }
}
