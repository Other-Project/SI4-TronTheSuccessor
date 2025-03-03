import {HTMLComponent} from "/js/component.js";
import {getCookie} from "/js/login-manager.js";

export class HomePage extends HTMLComponent {
    ids = ["sign-in", "sign-up"];

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

        const username = getCookie("username");
        if (username) {
            this.shadowRoot.getElementById("username").textContent = username;
            console.log("username", username);
            this.shadowRoot.getElementById("connect").src = "/assets/disconnect.svg";
            this.shadowRoot.getElementById("connect").addEventListener("click", () => {
                document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                window.location.reload();
            });
        } else {
            this.shadowRoot.getElementById("username").style.display = "none";
        }
    }

    #changePopup(name) {
        this.ids.forEach((id) => {
            this.shadowRoot.getElementById(id).style.display = id === name ? "block" : "none";
        });
    }
}
