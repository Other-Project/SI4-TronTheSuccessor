import {HTMLComponent} from "/js/component.js";
import {changePage} from "/components/pages/pages.js";

export class ProfilePage extends HTMLComponent {
    constructor() {
        super("profile-page", ["html"], "/components/profile-page/app-profile-page");
    }

    onSetupCompleted = () => {
        this.shadowRoot.getElementById("home").addEventListener("click", () => changePage("/"));
    }
}
