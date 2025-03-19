import {HTMLComponent} from "/js/component.js";

export class ProfilePage extends HTMLComponent {
    constructor() {
        super("/components/profile-page/app-profile-page", "profile-page.html");
    }

    onSetupCompleted = async () => {
        this.shadowRoot.getElementById("home").addEventListener("click", () => {
            document.dispatchEvent(new CustomEvent("menu-selection", {detail: "home"}));
        });
    };
}
