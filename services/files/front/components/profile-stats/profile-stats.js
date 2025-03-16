import {HTMLComponent} from "/js/component.js";

export class ProfileStats extends HTMLComponent {
    constructor() {
        super("profile-stats", ["html", "css"]);
    }

    static get observedAttributes() {
        return ["data-games", "data-time", "data-streak", "data-winrate"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.updateTextContentFromAttributes();
    }

    updateTextContentFromAttributes() {
        const gamesElement = this.shadowRoot.getElementById("games");
        const timeElement = this.shadowRoot.getElementById("time");
        const streakElement = this.shadowRoot.getElementById("streak");
        const winrateElement = this.shadowRoot.getElementById("winrate");

        gamesElement.childNodes[0].textContent = this.getAttribute("data-games");
        timeElement.childNodes[0].textContent = this.getAttribute("data-time");
        streakElement.childNodes[0].textContent = this.getAttribute("data-streak");
        winrateElement.childNodes[0].textContent = this.getAttribute("data-winrate");
    }
}
