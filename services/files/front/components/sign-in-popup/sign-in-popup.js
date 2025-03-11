import {HTMLComponent} from "/js/component.js";
import {fakePageReload, loginFetch} from "/js/login-manager.js";

export class SignInPopup extends HTMLComponent {
    username;
    password;

    constructor() {
        super("sign-in-popup", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.username = this.shadowRoot.getElementById("username-input").shadowRoot.getElementById("answer");
        this.password = this.shadowRoot.getElementById("password-input").shadowRoot.getElementById("answer");

        this.shadowRoot.getElementById("link").addEventListener("click", () => {
            document.dispatchEvent(new CustomEvent("change-popup", {
                detail: {
                    name: "sign-up",
                    display: true
                }
            }));
        });

        this.shadowRoot.getElementById("password-link").addEventListener("click", () => {
            document.dispatchEvent(new CustomEvent("change-popup", {
                detail: {
                    name: "forget-password",
                    display: true
                }
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
        const body = JSON.stringify({username: username_value, password: password_value});
        const data = await loginFetch("sign-in", body);
        if (data) {
            document.cookie = `refreshToken=${data.refreshToken}; path=/; max-age=${60 * 60 * 24 * 7};`;
            document.cookie = `accessToken=${data.accessToken}; path=/; max-age=${60 * 60};`;
            fakePageReload();
            this.#clearInputs();
        }
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
