import {HTMLComponent} from "/js/component.js";
import {loginFetch} from "/js/login-manager.js";

export class ForgetPassword extends HTMLComponent {
    resetPasswordToken;

    constructor() {
        super("forget-password-popup", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.shadowRoot.getElementById("link").addEventListener("click", () => {
            document.dispatchEvent(new CustomEvent("change-popup", {
                detail: {name: "sign-in"}
            }));
        });

        this.shadowRoot.getElementById("username-button").addEventListener("click", async () => {
            if (!this.#usernameCheck()) return;
            await this.#fetchSecurityQuestionsForUser();
        });

        this.shadowRoot.getElementById("question-button").addEventListener("click", async () => {
            if (!this.#answersCheck()) return;
            await this.#verifyAnswers();
        });

        this.shadowRoot.getElementById("password-button").addEventListener("click", async () => {
            if (!this.#passwordsCheck()) return;
            await this.#resetPassword();
        });
    };

    onVisible = () => {
        this.showPart("username");
        this.clearInputs();
    };

    #usernameCheck() {
        const username = this.shadowRoot.getElementById("username-input").shadowRoot.getElementById("answer");
        username.setCustomValidity("");
        if (!username.validity.valid)
            username.setCustomValidity("Username must be at least 3 characters long and less than 20.");
        username.reportValidity();
        return username.validity.valid;
    }

    #answersCheck() {
        const firstAnswer = this.shadowRoot.getElementById("first-answer-input").shadowRoot.getElementById("answer");
        const secondAnswer = this.shadowRoot.getElementById("second-answer-input").shadowRoot.getElementById("answer");
        firstAnswer.setCustomValidity("");
        secondAnswer.setCustomValidity("");

        if (!firstAnswer.validity.valid)
            firstAnswer.setCustomValidity("Answer cannot be empty");

        if (!secondAnswer.validity.valid)
            secondAnswer.setCustomValidity("Answer cannot be empty");

        secondAnswer.reportValidity();
        firstAnswer.reportValidity();

        return firstAnswer.validity.valid && secondAnswer.validity.valid;
    }

    #passwordsCheck() {
        const newPassword = this.shadowRoot.getElementById("new-password-input").shadowRoot.getElementById("answer");
        const confirmPassword = this.shadowRoot.getElementById("confirm-password-input").shadowRoot.getElementById("answer");
        newPassword.setCustomValidity("");
        confirmPassword.setCustomValidity("");
        if (!newPassword.validity.valid)
            newPassword.setCustomValidity("Password must be at least 6 characters long and less than 20.");
        if (newPassword.value !== confirmPassword.value)
            confirmPassword.setCustomValidity("Passwords do not match.");
        confirmPassword.reportValidity();
        newPassword.reportValidity();
        return newPassword.validity.valid && confirmPassword.validity.valid;
    }

    async #fetchSecurityQuestionsForUser() {
        const username = this.shadowRoot.getElementById("username-input").shadowRoot.getElementById("answer").value;
        const body = JSON.stringify({username});
        const data = await loginFetch("security-questions", body);
        if (data) {
            for (let i = 0; i < data.length; i++) {
                this.shadowRoot.getElementById(`question-${i}`).innerText = data[i].question;
            }
            this.showPart("question");
        }
    }

    async #verifyAnswers() {
        const username = this.shadowRoot.getElementById("username-input").shadowRoot.getElementById("answer").value;
        const firstAnswer = this.shadowRoot.getElementById("first-answer-input").shadowRoot.getElementById("answer").value;
        const secondAnswer = this.shadowRoot.getElementById("second-answer-input").shadowRoot.getElementById("answer").value;
        const body = JSON.stringify({username, answers: [firstAnswer, secondAnswer]});
        const data = await loginFetch("verify-answers", body);
        if (data) {
            this.resetPasswordToken = data.resetPasswordToken;
            this.showPart("password");
        }
    }

    async #resetPassword() {
        const newPassword = this.shadowRoot.getElementById("new-password-input").shadowRoot.getElementById("answer").value;
        const body = JSON.stringify({newPassword});
        const data = await loginFetch("reset-password", body, this.resetPasswordToken);
        if (data) {
            document.cookie = `refreshToken=${data.refreshToken}; path=/; max-age=${60 * 60 * 24 * 7};`;
            document.cookie = `accessToken=${data.accessToken}; path=/; max-age=${60 * 60};`;
            this.shadowRoot.getElementById("password-reset-popup").style.display = "block";
        } else {
            this.showPart("username");
            this.clearInputs();
        }
    }

    showPart(part) {
        this.shadowRoot.querySelectorAll(".username-part").forEach(element => element.style.display = "none");
        this.shadowRoot.querySelectorAll(".question-part").forEach(element => element.style.display = "none");
        this.shadowRoot.querySelectorAll(".password-part").forEach(element => element.style.display = "none");
        this.shadowRoot.querySelectorAll(`.${part}-part`).forEach(element => element.style.display = "block");
    }

    clearInputs() {
        this.shadowRoot.querySelectorAll("app-input").forEach(element => {
            if (element.shadowRoot.getElementById("answer"))
                element.shadowRoot.getElementById("answer").value = "";
        });
    }
}
