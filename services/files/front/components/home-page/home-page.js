import {HTMLComponent} from "/js/component.js";

export class HomePage extends HTMLComponent {
    constructor() {
        super("home-page", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.shadowRoot.getElementById("home-page").addEventListener("click", (event) => {
            if (this.shadowRoot.getElementById("login-container").contains(event.target)) return;
            const profil = this.shadowRoot.getElementById("profil-display");
            if (event.target !== profil && !profil.contains(event.target)) {
                const menu = profil.shadowRoot.getElementById("dropdown-menu");
                menu.style.display = "none";
            }
        });
    };
}
