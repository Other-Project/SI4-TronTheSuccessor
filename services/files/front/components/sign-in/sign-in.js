import {HTMLComponent} from "/js/component.js";
import {loginFetch, parseJwt} from "/js/login-manager.js";

export class SignIn extends HTMLComponent {
    constructor() {
        super("sign-in", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.shadowRoot.getElementById("link").addEventListener("click", () => {
            document.dispatchEvent(new CustomEvent("change-popup", {
                detail: {name: "sign-up"}
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
            username.setCustomValidity("Username must be at least 3 characters long and less than 20 and contain only letters and numbers.");

        if (!password.validity.valid)
            password.setCustomValidity("Password must be at least 6 characters long and less than 20 and contain only letters and numbers.");

        password.reportValidity();
        username.reportValidity();

        console.log(username.validity.valid);
        console.log(password.validity.valid);

        return username.validity.valid &&
            password.validity.valid;
    }
}