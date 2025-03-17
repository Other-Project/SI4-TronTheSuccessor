import {HTMLComponent} from "/js/component.js";
import {disconnect} from "/js/login-manager.js";

export class LoginContainer extends HTMLComponent {
    popupContainer;

    constructor() {
        super("login-container", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.popupContainer = this.shadowRoot.getElementById("popup-container");

        this.addEventListener("change-popup", (event) => this.show(event.detail));
        this.addEventListener("hide-popup", () => this.show());

        this.shadowRoot.getElementById("disconnect-button").addEventListener("click", () => disconnect());
        this.shadowRoot.getElementById("cancel-button").addEventListener("click", () => this.show());
    };

    onVisible = () => this.show();

    show(name = null) {
        this.shadowRoot.querySelectorAll(".popup").forEach(popup => popup.style.display = popup.id === name ? "block" : "none");
    }
}
