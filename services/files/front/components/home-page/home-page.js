import {HTMLComponent} from "/js/component.js";

export class HomePage extends HTMLComponent {
    ids = ["sign-in", "sign-up", "forget-password"];

    constructor() {
        super("home-page", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.shadowRoot.getElementById("connect").addEventListener("click", () => {
            this.shadowRoot.getElementById("popup-container").style.display = "block";
        });

        this.shadowRoot.getElementById("popup-container").addEventListener("click", (event) => {
            if (event.target === this.shadowRoot.getElementById("popup-container")) {
                this.shadowRoot.getElementById("popup-container").style.display = "none";
            }
        });

        document.addEventListener("change-popup", (event) => {
            this.#changePopup(event.detail.name);
        });

        document.addEventListener("hide-login-popup", () => {
            this.shadowRoot.getElementById("popup-container").style.display = "none";
        });
    };

    #changePopup(name) {
        this.ids.forEach((id) => {
            this.shadowRoot.getElementById(id).style.display = id === name ? "block" : "none";
        });
    }
}
