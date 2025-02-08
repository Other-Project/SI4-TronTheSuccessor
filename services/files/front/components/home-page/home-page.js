import {HTMLComponent} from "/js/component.js";

export class HomePage extends HTMLComponent {
    constructor() {
        super("/components/home-page", "home-page.html");
    }

    onSetupCompleted = () => {
        this.shadowRoot.getElementById("connect").addEventListener("click", () => {
            document.dispatchEvent(new CustomEvent("menu-selection", {detail: "login"}));
        });
    }
}
