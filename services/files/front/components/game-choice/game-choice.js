import {HTMLComponent} from "/js/component.js";
import {getCookie} from "/js/login-manager.js";
import {changePage} from "/components/pages/pages.js";

export class GameChoice extends HTMLComponent {
    constructor() {
        super("game-choice", ["html"]);
    }

    onSetupCompleted = () => {
        this.computerButton = this.shadowRoot.getElementById("computer");
        this.multiplayerButton = this.shadowRoot.getElementById("multiplayer");

        this.shadowRoot.getElementById("local-game").addEventListener("click", () => changePage("/game/local"));
        this.computerButton.addEventListener("click", () => changePage("/game/computer"));
        this.multiplayerButton.addEventListener("click", () => changePage("/game/any-player"));
    };

    onVisible = () => {
        const refreshToken = getCookie("refreshToken");
        this.computerButton.title = !refreshToken ? "You need to be logged in to play against the computer" : "";
        this.computerButton.button.disabled = !refreshToken;
        this.multiplayerButton.title = !refreshToken ? "You need to be logged in to play against other players" : "";
        this.multiplayerButton.button.disabled = !refreshToken;
        if (refreshToken) {
            this.multiplayerButton.setAttribute("pulse", "true");
            this.multiplayerButton.setAttribute("background", "#430e57");
        }
    };
}
