import {HTMLComponent} from "/js/component.js";
import {getCookie} from "/js/login-manager.js";

export class GameChoice extends HTMLComponent {
    constructor() {
        super("game-choice", ["html"]);
    }

    onSetupCompleted = () => {
        this.shadowRoot.getElementById("local-game").addEventListener("click", () => {
            document.dispatchEvent(new CustomEvent("menu-selection", {
                detail: {
                    name: "help",
                    attr: {"against": "local"}
                }
            }));
        });
        this.shadowRoot.getElementById("computer").addEventListener("click", () => {
            if (!getCookie("refreshToken")) {
                alert("You must be log in to play against the computer");
                return;
            }
            document.dispatchEvent(new CustomEvent("menu-selection", {
                detail: {
                    name: "help",
                    attr: {"against": "computer"}
                }
            }));
        });
    }
}
