import {HTMLComponent} from "/js/component.js";

export class GameChoice extends HTMLComponent {
    constructor() {
        super("/components/game-choice/app-game-choice", "game-choice.html");
    }

    onSetupCompleted = () => {
        this.shadowRoot.getElementById("local-game").addEventListener("click", () => {
            document.dispatchEvent(new CustomEvent("menu-selection", {detail: "help"}));
        });
    }
}
