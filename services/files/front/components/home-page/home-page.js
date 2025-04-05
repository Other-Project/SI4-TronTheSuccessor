import {HTMLComponent} from "/js/component.js";

export class HomePage extends HTMLComponent {
    constructor() {
        super("home-page", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.onlinePlayers = this.shadowRoot.getElementById("player-count");
        document.addEventListener("user-count-update", (event) => {
            this.onlinePlayers.textContent = event.detail.nb;
        });
    };
}
