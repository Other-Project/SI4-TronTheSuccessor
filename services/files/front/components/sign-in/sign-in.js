import {HTMLComponent} from "/js/component.js";

export class SignIn extends HTMLComponent {
    constructor() {
        super("sign-in", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.shadowRoot.getElementById("sign-in").addEventListener("click", () => {
            this.shadowRoot.getElementById("popup-container").style.display = "block";
        });

        this.shadowRoot.getElementById("link").addEventListener("click", () => {
            document.dispatchEvent(new CustomEvent("change-popup", {
                detail: {name: "sign-up"}
            }))
        });
    }
}