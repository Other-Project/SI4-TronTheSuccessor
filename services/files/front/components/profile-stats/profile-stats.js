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
        const {formattedTime} = this.#formatTime(this.time);
        this.timeElement.childNodes[0].textContent = formattedTime;
        this.shadowRoot.querySelector("#time .label").textContent = `Time Played`;
        this.streakElement.childNodes[0].textContent = this.streak;
        this.winrateElement.childNodes[0].textContent = this.winrate;
    }

    #formatTime(seconds, wantedLength = 4) {
        const units = [
            {unit: "seconds", shortenUnit: "s", max: 60},
            {unit: "minutes", shortenUnit: "m", max: 60},
            {unit: "hours", shortenUnit: "h", max: 24},
            {unit: "days", shortenUnit: "d"}
        ];
        let value = parseInt(seconds);
        if (isNaN(value)) value = 0;
        let subValue = 0;
        let subValueMaxLength = 0;
        for (let unitInfo of units) {
            if (!unitInfo.max || value < unitInfo.max) {
                const valueString = value.toString();
                if (wantedLength - 1 - valueString.length < subValueMaxLength) subValueMaxLength = 0;
                const subValueString = subValueMaxLength > 0 ? subValue.toString().padStart(subValueMaxLength, "0") : "";
                const formattedValue = valueString.padStart(wantedLength - 1 - subValueMaxLength, "0") + unitInfo.shortenUnit + subValueString;
                return {formattedTime: formattedValue, unit: unitInfo.unit};
            }
            subValue = value % unitInfo.max;
            value = Math.floor(value / unitInfo.max);
            subValueMaxLength = unitInfo.max.toString().length;
        }
    }
}
