import {HTMLComponent} from "/js/component.js";
import {changePage} from "/components/pages/pages.js";

export class ProfilePage extends HTMLComponent {
    constructor() {
        super("/components/profile-page/app-profile-page", "profile-page.html");
    }

    onSetupCompleted = () => {
        this.shadowRoot.getElementById("home").addEventListener("click", () => changePage("/"));
    }
}
