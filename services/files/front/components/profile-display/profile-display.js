import {HTMLComponent} from "/js/component.js";
import {getUserInfo} from "/js/login-manager.js";
import {changePage} from "/components/pages/pages.js";

export class ProfileDisplay extends HTMLComponent {
    dropDownMenu;

    constructor() {
        super("profile-display", ["html", "css"]);
    }

    onSetupCompleted = async () => {
        this.dropDownMenu = this.shadowRoot.getElementById("dropdown-menu");
        this.loginContainer = this.shadowRoot.getElementById("login-container");
        this.container = this.shadowRoot.getElementById("container");
        this.username = this.shadowRoot.getElementById("username");


        this.shadowRoot.getElementById("profile").addEventListener("click", () => {
            this.toggleDropdown();
        });

        this.shadowRoot.getElementById("connect").addEventListener("click", () => this.loginContainer.show("sign-in"));
        this.shadowRoot.getElementById("logout").addEventListener("click", () => this.loginContainer.show("disconnect"));
        this.shadowRoot.getElementById("settings").addEventListener("click", () => changePage("/settings"));
        this.shadowRoot.getElementById("profile-menu").addEventListener("click", () => changePage("/profile"));
    };

    onVisible = async () => {
        const user = getUserInfo();
        this.container.classList.toggle("connected", !!user);
        this.username.textContent = user?.username;
        this.toggleDropdown(false);
    };

    toggleDropdown(show = undefined) {
        show ??= this.dropDownMenu.style.display === "none";
        this.dropDownMenu.style.display = show ? "block" : "none";
    }
}
