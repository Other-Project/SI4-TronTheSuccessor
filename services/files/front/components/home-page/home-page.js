import {HTMLComponent} from "/js/component.js";

export class HomePage extends HTMLComponent {
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
    }
}
