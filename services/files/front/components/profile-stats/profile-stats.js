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
        const {formattedTime, unit} = this.#formatTime(this.time);
        this.timeElement.childNodes[0].textContent = formattedTime;
        this.shadowRoot.querySelector("#time .label").textContent = `Time Played (${unit})`;
        this.streakElement.childNodes[0].textContent = this.streak;
        this.winrateElement.childNodes[0].textContent = this.winrate;
    }

    #formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        if (hours > 0) {
            const formattedHours = hours % 1 === 0 ?
                hours.toFixed(0).padStart(3, '0') :
                hours.toFixed(3 - Math.floor(hours).toString().length);
            return {formattedTime: `${formattedHours}h`, unit: "hours"};
        }

        if (minutes > 0) {
            const formattedMinutes = minutes % 1 === 0 ?
                minutes.toFixed(0).padStart(3, '0') :
                minutes.toFixed(3 - Math.floor(minutes).toString().length);
            return {formattedTime: `${formattedMinutes}m`, unit: "minutes"};
        }

        const formattedSeconds = remainingSeconds % 1 === 0 ?
            remainingSeconds.toFixed(0).padStart(3, '0') :
            remainingSeconds.toFixed(3 - Math.floor(remainingSeconds).toString().length);
        return {formattedTime: `${formattedSeconds}s`, unit: "seconds"};
    }
}
