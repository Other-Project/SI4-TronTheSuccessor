import {HTMLComponent} from "/js/component.js";
import {fakePageReload, fetchPostApi, storeTokens} from "/js/login-manager.js";

export class SignInPopup extends HTMLComponent {
    username;
    password;

    constructor() {
        super("sign-in-popup", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.username = this.shadowRoot.getElementById("username-input").input_answer;
        this.password = this.shadowRoot.getElementById("password-input").input_answer;

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
        const username_value = this.username.value;
        const password_value = this.password.value;
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
        this.username.setCustomValidity("");
        this.password.setCustomValidity("");

        if (!this.username.validity.valid)
            this.username.setCustomValidity("Username must be at least 3 characters long and less than 20.");

        if (!this.password.validity.valid)
            this.password.setCustomValidity("Password must be at least 6 characters long and less than 20.");

        this.password.reportValidity();
        this.username.reportValidity();

        return this.username.validity.valid &&
            this.password.validity.valid;
    }

    #clearInputs() {
        this.username.value = "";
        this.password.value = "";
    }
}
