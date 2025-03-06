import {HTMLComponent} from "/js/component.js";
import {getCookie} from "/js/login-manager.js";

export class ProfilDisplay extends HTMLComponent {
    constructor() {
        super("profil-display", ["html", "css"]);
    }

    onSetupCompleted = async () => {
        if (getCookie("accessToken")) {
            this.shadowRoot.querySelectorAll(".connected").forEach(element => element.style.display = "block");
            this.shadowRoot.getElementById("disconnected").style.display = "none";
        } else {
            this.shadowRoot.getElementById("disconnected").style.display = "block";
            this.shadowRoot.querySelectorAll(".connected").forEach(element => element.style.display = "none");
        }

        this.shadowRoot.getElementById("connected").addEventListener("click", () => {
            document.dispatchEvent(new CustomEvent("change-popup", {
                detail: {name: "disconnect"}
            }));

        });

        this.shadowRoot.getElementById("disconnected").addEventListener("click", () => {
            document.dispatchEvent(new CustomEvent("show-popup-container"));
        });
    };
}
