import {HTMLComponent} from "/js/component.js";

export class ProfilPage extends HTMLComponent {
    constructor() {
        super("/components/profil-page/app-profil-page", "profil-page.html");
    }

    onSetupCompleted = () => {
        this.shadowRoot.getElementById("home").addEventListener("click", () => {
            document.dispatchEvent(new CustomEvent("menu-selection", {detail: "home"}));
        });
    }
}
