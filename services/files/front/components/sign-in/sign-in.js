import {HTMLComponent} from "/js/component.js";

export class SignIn extends HTMLComponent {
    constructor() {
        super("sign-in", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.shadowRoot.getElementById("sign-in").addEventListener("click", () => {
            this.shadowRoot.getElementById("popup-container").style.display = "block";
        });

        this.shadowRoot.getElementById("popup-container").addEventListener("click", (event) => {
            if (event.target === this.shadowRoot.getElementById("popup-container")) {
                this.shadowRoot.getElementById("popup-container").style.display = "none";
            }
        });
    }
}