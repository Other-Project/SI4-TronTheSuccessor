import {HTMLComponent} from "/js/component.js";
import {fakePageReload, fetchPostApi, storeTokens} from "/js/login-manager.js";

export class SignInPopup extends HTMLComponent {
    username;
    password;

    constructor() {
        super("sign-in-popup", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.username = this.shadowRoot.getElementById("username-input");
        this.password = this.shadowRoot.getElementById("password-input");

        this.shadowRoot.getElementById("link").addEventListener("click", () => {
            this.dispatchEvent(new CustomEvent("change-popup", {detail: "sign-up", bubbles: true, composed: true}));
        });

        this.shadowRoot.getElementById("password-link").addEventListener("click", () => {
            this.dispatchEvent(new CustomEvent("change-popup", {
                detail: "forget-password",
                bubbles: true,
                composed: true
            }));
        });

        this.shadowRoot.getElementById("login").addEventListener("click", async () => {
            if (!this.correctInputs()) return;
            await this.#loginFetch();
        });
    };

    async #loginFetch() {
        const username_value = this.username.input.value;
        const password_value = this.password.input.value;
        const body = {username: username_value, password: password_value};
        const response = await fetchPostApi("/api/user/sign-in", body);
        const data = await response.json();
        if (response.ok) {
            storeTokens(data);
            fakePageReload();
            this.#clearInputs();
            this.dispatchEvent(new CustomEvent("logged-in", {bubbles: true, composed: true}));
        } else
            alert(data?.error ?? response.statusText);
    }

    correctInputs() {
        this.username.input.setCustomValidity("");
        this.password.input.setCustomValidity("");

        if (!this.username.input.validity.valid)
            this.username.input.setCustomValidity("Username must be at least 3 characters long and less than 20.");

        if (!this.password.input.validity.valid)
            this.password.input.setCustomValidity("Password must be at least 6 characters long and less than 20.");

        this.password.input.reportValidity();
        this.username.input.reportValidity();

        return this.username.input.validity.valid && this.password.input.validity.valid;
    }

    #clearInputs() {
        this.username.input.value = "";
        this.password.input.value = "";
    }
}
