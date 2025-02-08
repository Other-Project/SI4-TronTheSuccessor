import {HTMLComponent} from "/js/component.js";

export class GameChoice extends HTMLComponent {
    constructor() {
        super("game-choice", ["html"]);
    }

    onSetupCompleted = () => {
        this.shadowRoot.getElementById("local-game").addEventListener("click", () => {
            document.dispatchEvent(new CustomEvent("menu-selection", {detail: {name: "help", attr: {"against": "local"}}}));
        });
        this.shadowRoot.getElementById("computer").addEventListener("click", () => {
            document.dispatchEvent(new CustomEvent("menu-selection", {detail: {name: "help", attr: {"against": "computer"}}}));
        });
    }
}
