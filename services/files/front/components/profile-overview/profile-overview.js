import {HTMLComponent} from "/js/component.js";

export class ProfileOverview extends HTMLComponent {
    constructor() {
        super("profile-overview", ["html", "css"]);
    }

    static get observedAttributes() {
        return ["stats"];
    }

    onVisible = async () => {
        this.#refresh();
    };

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (name === "stats") this.stats = JSON.parse(newValue);
        this.#refresh();
    }

    onSetupCompleted = () => {
        this.rank = this.shadowRoot.getElementById("profile-rank");
        this.profileStats = this.shadowRoot.getElementById("profiles-stats");
        //this.profilePfp = this.shadowRoot.getElementById("profile-pfp");
        //this.buttons = this.shadowRoot.getElementById("profile-buttons-container");

        /* this.shadowRoot.getElementById("modify-password").addEventListener("click", () => {
             // TODO: implement password change
         });*/

    };

    #refresh() {
        if (!this.rank || !this.stats) return;
        /*if (this.stats.loggedusername && this.stats.loggedusername === this.stats.username)
            this.buttons.classList.toggle("logged-in");*/


        //this.profilePfp.setAttribute("src", `/api/user/${this.stats.username}/avatar`);
        //this.profilePfp.setAttribute("username", this.stats.username);
        this.rank.setAttribute("rank", this.stats.rank);
        this.rank.setAttribute("points", this.stats.eloInRank);
        this.rank.setAttribute("baserank", this.stats.baseRank);
        this.rank.setAttribute("height", "400");
        this.profileStats.setAttribute("games", this.stats.games);
        this.profileStats.setAttribute("time", this.stats.timePlayed);
        this.profileStats.setAttribute("streak", this.stats.winStreak);
        const totalGames = this.stats.games - this.stats.draws;
        if (totalGames === 0) this.profileStats.setAttribute("winrate", "-");
        else this.profileStats.setAttribute("winrate", Math.round((this.stats.wins * 100 / totalGames)));
    }
}
