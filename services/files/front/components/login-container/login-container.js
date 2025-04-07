import {HTMLComponent} from "/js/component.js";
import {disconnect, getCookie} from "/js/login-manager.js";

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
        this.cancelButton = this.shadowRoot.getElementById("cancel-button");
        this.cancelButton.addEventListener("click", () => this.show());
        const refreshToken = getCookie("refreshToken");
        this.cancelButton.button.classList.toggle("animated", !!refreshToken);
        this.cancelButton.button.classList.toggle("cancel_background", !!refreshToken);
    };

    onVisible = () => this.show();

    show(name = null) {
        this.shadowRoot.querySelectorAll(".popup").forEach(popup => popup.style.display = popup.id === name ? "block" : "none");
    }
}
