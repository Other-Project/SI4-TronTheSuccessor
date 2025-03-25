import {HTMLComponent} from "/js/component.js";
import {getCookie} from "/js/login-manager.js";
import {changePage} from "/components/pages/pages.js";

export class GameChoice extends HTMLComponent {
    constructor() {
        super("game-choice", ["html"]);
    }

    onSetupCompleted = () => {
        const computerButton = this.shadowRoot.getElementById("computer");
        const multiplayerButton = this.shadowRoot.getElementById("multiplayer");

        if (!getCookie("refreshToken")) {
            computerButton.button.disabled = true;
            multiplayerButton.button.disabled = true;
        }

        this.shadowRoot.getElementById("local-game").addEventListener("click", () => changePage("/game/local"));
        computerButton.addEventListener("click", () => changePage("/game/computer"));
        multiplayerButton.addEventListener("click", () => changePage("/game/any-player"));
    };

    onVisible = () => {
        const computerButton = this.shadowRoot.getElementById("computer");
        const multiplayerButton = this.shadowRoot.getElementById("multiplayer");

        const refreshToken = getCookie("refreshToken");
        computerButton.button.disabled = !refreshToken;
        multiplayerButton.button.disabled = !refreshToken;
    };
}
