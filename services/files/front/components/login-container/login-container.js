import {HTMLComponent} from "/js/component.js";
import {disconnect} from "/js/login-manager.js";

export class LoginContainer extends HTMLComponent {
    ids = ["sign-in", "sign-up", "forget-password", "disconnect"];

    constructor() {
        super("login-container", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.shadowRoot.getElementById("popup-container").addEventListener("click", (event) => {
            if (event.target === this.shadowRoot.getElementById("popup-container")) {
                this.shadowRoot.getElementById("popup-container").style.display = "none";
            }
        });

        document.addEventListener("change-popup", (event) => {
            this.#changePopup(event.detail.name);
        });

        document.addEventListener("show-popup-container", () => {
            this.shadowRoot.getElementById("popup-container").style.display = "block";
        });

        document.addEventListener("hide-login-popup", () => {
            this.shadowRoot.getElementById("popup-container").style.display = "none";
        });

        this.shadowRoot.getElementById("disconnect-button").addEventListener("click", () => {
            disconnect();
        });

        this.shadowRoot.getElementById("cancel-button").addEventListener("click", () => {
            this.shadowRoot.getElementById("popup-container").style.display = "none";
        });
    };

    #changePopup(name) {
        this.shadowRoot.getElementById("popup-container").style.display = "block";
        this.ids.forEach((id) => {
            this.shadowRoot.getElementById(id).style.display = id === name ? "block" : "none";
        });
    }
}
