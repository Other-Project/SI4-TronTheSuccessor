import {HTMLComponent} from "/js/component.js";

export class Login extends HTMLComponent {
    constructor() {
        super("login", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.shadowRoot.getElementById("sign-in").addEventListener("click", () => {
            alert("Sign in");
        });

        this.shadowRoot.getElementById("sign-up").addEventListener("click", () => {
            alert("Sign up");
        });
    }
}
