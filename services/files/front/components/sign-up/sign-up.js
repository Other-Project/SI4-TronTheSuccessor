import {HTMLComponent} from "/js/component.js";
import {loginFetch, parseJwt} from "/js/login-manager.js";

export class SignUp extends HTMLComponent {

    constructor() {
        super("sign-up", ["html", "css"]);
    }

    onSetupCompleted = async () => {
        await this.#injectSecurityQuestions();

        this.shadowRoot.getElementById("next").addEventListener("click", () => {
            this.shadowRoot.querySelectorAll(".first-page").forEach(element => element.style.display = "none");
            this.shadowRoot.querySelectorAll(".second-page").forEach(element => element.style.display = "block");
        });

        this.shadowRoot.getElementById("previous").addEventListener("click", () => {
            this.shadowRoot.querySelectorAll(".first-page").forEach(element => element.style.display = "block");
            this.shadowRoot.querySelectorAll(".second-page").forEach(element => element.style.display = "none");
        });

        this.shadowRoot.getElementById("login").addEventListener("click", async () => {
            if (!this.correctInputValues()) return;
            await this.#fetchLogin();
        });

        this.shadowRoot.getElementById("link").addEventListener("click", () => {
            document.dispatchEvent(new CustomEvent("change-popup", {detail: {name: "sign-in"}}));
        });
    };

    async #fetchLogin() {
        const body = JSON.stringify({
            username: this.shadowRoot.getElementById("username").value,
            password: this.shadowRoot.getElementById("password").value,
            securityQuestions: [
                {
                    question: this.shadowRoot.getElementById("first-question").shadowRoot.querySelector("select").value,
                    answer: this.shadowRoot.getElementById("first-answer").value
                },
                {
                    question: this.shadowRoot.getElementById("second-question").shadowRoot.querySelector("select").value,
                    answer: this.shadowRoot.getElementById("second-answer").value
                }
            ]
        });
        const data = await loginFetch("sign-up", body);
        document.cookie = `refreshToken=${data.refreshToken}; path=/; max-age=${60 * 60 * 24 * 7};`;
        document.cookie = `accessToken=${data.accessToken}; path=/; max-age=${60 * 60};`;
        const result = await parseJwt(data.accessToken);
        window.localStorage.setItem("userData", result);
        location.reload();
    }

    correctInputValues() {
        const username = this.shadowRoot.getElementById("username");
        const password = this.shadowRoot.getElementById("password");
        const confirmPassword = this.shadowRoot.getElementById("confirm-password");
        const firstSecurityAnswer = this.shadowRoot.getElementById("first-answer");
        const secondSecurityAnswer = this.shadowRoot.getElementById("second-answer");

        username.setCustomValidity("");
        password.setCustomValidity("");
        confirmPassword.setCustomValidity("");
        firstSecurityAnswer.setCustomValidity("");
        secondSecurityAnswer.setCustomValidity("");

        if (!username.validity.valid)
            username.setCustomValidity("Username must be at least 3 characters long and less than 20 and contain only letters and numbers.");

        if (!password.validity.valid)
            password.setCustomValidity("Password must be at least 6 characters long and less than 20 and contain only letters and numbers.");

        if (!confirmPassword.validity.valid)
            confirmPassword.setCustomValidity("Please confirm your password.");

        if (password.value !== confirmPassword.value)
            confirmPassword.setCustomValidity("Passwords do not match.");

        if (!firstSecurityAnswer.validity.valid)
            firstSecurityAnswer.setCustomValidity("Please provide an answer to the first security question.");

        if (!secondSecurityAnswer.validity.valid)
            secondSecurityAnswer.setCustomValidity("Please provide an answer to the second security question.");

        secondSecurityAnswer.reportValidity();
        firstSecurityAnswer.reportValidity();
        confirmPassword.reportValidity();
        password.reportValidity();
        username.reportValidity();

        return username.validity.valid &&
            password.validity.valid &&
            confirmPassword.validity.valid &&
            firstSecurityAnswer.validity.valid &&
            secondSecurityAnswer.validity.valid;
    }

    async #injectSecurityQuestions() {
        const securityQuestions = await loginFetch("security-questions", null);
        const firstQuestion = this.shadowRoot.getElementById("first-security-question");
        const secondQuestion = this.shadowRoot.getElementById("second-security-question");

        for (let i = 0; i < securityQuestions.length; i++) {
            console.log(securityQuestions[i]);
            let opt = document.createElement("option");
            opt.value = i;
            opt.innerHTML = securityQuestions[i];
            firstQuestion.appendChild(opt);
            secondQuestion.appendChild(opt.cloneNode(true));
        }
    }
}
