import {HTMLComponent} from "/js/component.js";
import {loginFetch, parseJwt} from "/js/login-manager.js";

export class SignInPopup extends HTMLComponent {
    constructor() {
        super("sign-in-popup", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.shadowRoot.getElementById("link").addEventListener("click", () => {
            document.dispatchEvent(new CustomEvent("change-popup", {
                detail: {name: "sign-up"}
            }));
        });

        this.shadowRoot.getElementById("password-link").addEventListener("click", () => {
            document.dispatchEvent(new CustomEvent("change-popup", {
                detail: {name: "forget-password"}
            }));
        });

        this.shadowRoot.getElementById("login").addEventListener("click", async () => {
            if (!this.correctInputs()) return;
            await this.#loginFetch();
        });
    };

    async #loginFetch() {
        const username = this.shadowRoot.getElementById("username-input").shadowRoot.getElementById("answer").value;
        const password = this.shadowRoot.getElementById("password-input").shadowRoot.getElementById("answer").value;
        const body = JSON.stringify({username, password});
        const data = await loginFetch("sign-in", body);
        if (data) {
            document.cookie = `refreshToken=${data.refreshToken}; path=/; max-age=${60 * 60 * 24 * 7};`;
            document.cookie = `accessToken=${data.accessToken}; path=/; max-age=${60 * 60};`;
            const result = await parseJwt(data.accessToken);
            window.localStorage.setItem("userData", result);
            location.reload();
        }
    }

    correctInputs() {
        const username = this.shadowRoot.getElementById("username-input").shadowRoot.getElementById("answer");
        const password = this.shadowRoot.getElementById("password-input").shadowRoot.getElementById("answer");
        username.setCustomValidity("");
        password.setCustomValidity("");

        if (!username.validity.valid)
            username.setCustomValidity("Username must be at least 3 characters long and less than 20.");

        if (!password.validity.valid)
            password.setCustomValidity("Password must be at least 6 characters long and less than 20.");

        password.reportValidity();
        username.reportValidity();

        return username.validity.valid &&
            password.validity.valid;
    }
}
