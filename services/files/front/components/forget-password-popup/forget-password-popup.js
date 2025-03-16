import {HTMLComponent} from "/js/component.js";
import {loginFetch, popupEvent, storeTokens} from "/js/login-manager.js";

export class ForgetPassword extends HTMLComponent {
    resetPasswordToken;
    usernameInput;
    firstAnswerInput;
    secondAnswerInput;
    passwordInput;
    confirmPasswordInput;

    constructor() {
        super("forget-password-popup", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.firstAnswerInput = this.shadowRoot.getElementById("first-answer-input").input_answer;
        this.secondAnswerInput = this.shadowRoot.getElementById("second-answer-input").input_answer;
        this.usernameInput = this.shadowRoot.getElementById("username-input").input_answer;
        this.passwordInput = this.shadowRoot.getElementById("new-password-input").input_answer;
        this.confirmPasswordInput = this.shadowRoot.getElementById("confirm-password-input").input_answer;

        this.shadowRoot.getElementById("link").addEventListener("click", () => {
            popupEvent.dispatchEvent(new CustomEvent("change-popup", {
                detail: {name: "sign-in", display: true}
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
        this.usernameInput.setCustomValidity("");
        if (!this.usernameInput.validity.valid)
            this.usernameInput.setCustomValidity("Username must be at least 3 characters long and less than 20.");
        this.usernameInput.reportValidity();
        return this.usernameInput.validity.valid;
    }

    #answersCheck() {
        this.firstAnswerInput.setCustomValidity("");
        this.secondAnswerInput.setCustomValidity("");

        if (!this.firstAnswerInput.validity.valid)
            this.firstAnswerInput.setCustomValidity("Answer cannot be empty");

        if (!this.secondAnswerInput.validity.valid)
            this.secondAnswerInput.setCustomValidity("Answer cannot be empty");

        this.secondAnswerInput.reportValidity();
        this.firstAnswerInput.reportValidity();

        return this.firstAnswerInput.validity.valid && this.secondAnswerInput.validity.valid;
    }

    #passwordsCheck() {
        this.passwordInput.setCustomValidity("");
        this.confirmPasswordInput.setCustomValidity("");
        if (!this.passwordInput.validity.valid)
            this.passwordInput.setCustomValidity("Password must be at least 6 characters long and less than 20.");
        if (this.passwordInput.value !== this.confirmPasswordInput.value)
            this.confirmPasswordInput.setCustomValidity("Passwords do not match.");
        this.confirmPasswordInput.reportValidity();
        this.passwordInput.reportValidity();
        return this.passwordInput.validity.valid && this.confirmPasswordInput.validity.valid;
    }

    async #fetchSecurityQuestionsForUser() {
        const username = this.usernameInput.value;
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
        const username = this.usernameInput.value;
        const firstAnswer = this.firstAnswerInput.value;
        const secondAnswer = this.secondAnswerInput.value;
        const body = JSON.stringify({username, answers: [firstAnswer, secondAnswer]});
        const data = await loginFetch("verify-answers", body);
        if (data) {
            this.resetPasswordToken = data.resetPasswordToken;
            this.showPart("password");
        }
    }

    async #resetPassword() {
        const password = this.passwordInput.value;
        const body = JSON.stringify({newPassword: password});
        const data = await loginFetch("reset-password", body, this.resetPasswordToken);
        if (data) {
            storeTokens(data);
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
