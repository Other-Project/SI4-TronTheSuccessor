import {HTMLComponent} from "/js/component.js";
import {disconnect, popupEvent} from "/js/login-manager.js";

export class LoginContainer extends HTMLComponent {
    ids = ["sign-in", "sign-up", "forget-password", "disconnect"];
    popupContainer;

    constructor() {
        super("login-container", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.popupContainer = this.shadowRoot.getElementById("popup-container");

        popupEvent.addEventListener("change-popup", (event) => {
            this.#changePopup(event.detail.name, event.detail.display);
        });

        popupEvent.addEventListener("show-popup-container", () => {
            this.popupContainer.style.display = "block";
        });

        popupEvent.addEventListener("hide-popup", () => {
            this.popupContainer.style.display = "none";
        });

        this.shadowRoot.getElementById("disconnect-button").addEventListener("click", () => {
            disconnect();
        });

        this.shadowRoot.getElementById("cancel-button").addEventListener("click", () => {
            this.popupContainer.style.display = "none";
        });
    };

    #changePopup(name, shouldDisplay) {
        this.popupContainer.style.display = shouldDisplay ? "block" : "none";
        this.ids.forEach((id) => {
            this.shadowRoot.getElementById(id).style.display = id === name ? "block" : "none";
        });
    }
}
