import {HTMLComponent} from "/js/component.js";
import {getCookie, parseJwt} from "/js/login-manager.js";

export class ProfilDisplay extends HTMLComponent {
    constructor() {
        super("profil-display", ["html", "css"]);
    }

    onSetupCompleted = async () => {
        if (getCookie("accessToken")) {
            this.shadowRoot.getElementById("profil").classList.add("connected");
            this.shadowRoot.getElementById("username").innerText = (await parseJwt(getCookie("accessToken"))).username;
        }

        this.shadowRoot.getElementById("connected").addEventListener("click", () => {
            const menu = this.shadowRoot.getElementById("dropdown-menu");
            menu.style.display = menu.style.display === "block" ? "none" : "block";
        });

        this.shadowRoot.getElementById("disconnected").addEventListener("click", () => {
            document.dispatchEvent(new CustomEvent("show-popup-container"));
        });

        this.shadowRoot.getElementById("logout").addEventListener("click", () => {
            document.dispatchEvent(new CustomEvent("change-popup", {
                detail: {name: "disconnect"}
            }));
        });
    };
}
