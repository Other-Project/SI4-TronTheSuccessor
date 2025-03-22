import {HTMLComponent} from "/js/component.js";

export class ProfilePage extends HTMLComponent {
    constructor() {
        super("profile-page", ["html"], "/components/profile-page/app-profile-page");
    }

    onSetupCompleted = async () => {
        this.shadowRoot.getElementById("home").addEventListener("click", () => {
            document.dispatchEvent(new CustomEvent("menu-selection", {detail: "home"}));
        });
    };
}
