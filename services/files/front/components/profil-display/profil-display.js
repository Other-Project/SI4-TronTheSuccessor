import {HTMLComponent} from "/js/component.js";
import {getCookie, parseJwt, popupEvent} from "/js/login-manager.js";

export class ProfilDisplay extends HTMLComponent {
    dropDownMenu;

    constructor() {
        super("profil-display", ["html", "css"]);
    }

    onSetupCompleted = async () => {
        this.dropDownMenu = this.shadowRoot.getElementById("dropdown-menu");

        this.shadowRoot.getElementById("connected").addEventListener("click", () => {
            this.dropDownMenu.style.display = this.dropDownMenu.style.display === "block" ? "none" : "block";
        });

        this.shadowRoot.getElementById("disconnected").addEventListener("click", () => {
            popupEvent.dispatchEvent(new CustomEvent("show-popup-container"));
        });

        this.shadowRoot.getElementById("logout").addEventListener("click", () => {
            popupEvent.dispatchEvent(new CustomEvent("change-popup", {
                detail: {name: "disconnect", display: true}
            }));
        });
    };

    onVisible = async () => {
        if (getCookie("refreshToken")) {
            this.shadowRoot.getElementById("profil").classList.add("connected");
            this.shadowRoot.getElementById("username").innerText = (await parseJwt(getCookie("refreshToken"))).username;
            popupEvent.dispatchEvent(new CustomEvent("change-popup", {
                detail: {name: "disconnect", display: false}
            }));
        } else {
            this.shadowRoot.getElementById("profil").classList.remove("connected");
            this.shadowRoot.getElementById("dropdown-menu").style.display = "none";
            popupEvent.dispatchEvent(new CustomEvent("change-popup", {
                detail: {name: "sign-in", display: false}
            }));
        }
    };
}
