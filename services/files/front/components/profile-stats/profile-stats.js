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
        this.#fetchStats();
    };

    #fetchStats() {
        // TODO: Fetch stats from the backend

        const data = {
            games: 10,
            winrate: 50,
            time: 5,
            streak: 3
        };

        this.#updateStats(data);

    }

    #updateStats(data) {
        this.games.childNodes[0].nodeValue = data.games || "NA";
        this.winrate.childNodes[0].nodeValue = `${data.winrate || "NA"}%`;
        this.time.childNodes[0].nodeValue = `${data.time || "NA"}h`;
        this.streak.childNodes[0].nodeValue = data.streak || "NA";
    }
}
