import {HTMLComponent} from "/js/component.js";

export class HomePage extends HTMLComponent {
    ids = ["sign-in", "sign-up"];

    constructor() {
        super("/components/home-page", "home-page.html");
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
    }

    #changePopup(name) {
        this.ids.forEach((id) => {
            this.shadowRoot.getElementById(id).style.display = id === name ? "block" : "none";
        });
    }
}
