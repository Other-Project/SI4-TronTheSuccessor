import {HTMLComponent} from "/js/component.js";
import {fakePageReload, fetchApi, fetchPostApi, storeTokens} from "/js/login-manager.js";

export class ResetPassword extends HTMLComponent {
    resetPasswordToken;
    usernameInput;
    firstAnswerInput;
    secondAnswerInput;
    passwordInput;
    confirmPasswordInput;

    constructor() {
        super("reset-password-popup", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.firstAnswerInput = this.shadowRoot.getElementById("first-answer-input");
        this.secondAnswerInput = this.shadowRoot.getElementById("second-answer-input");
        this.usernameInput = this.shadowRoot.getElementById("username-input");
        this.passwordInput = this.shadowRoot.getElementById("new-password-input");
        this.confirmPasswordInput = this.shadowRoot.getElementById("confirm-password-input");

        this.shadowRoot.getElementById("link").addEventListener("click", () => {
            this.dispatchEvent(new CustomEvent("change-popup", {detail: "sign-in", bubbles: true, composed: true}));
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

        this.shadowRoot.getElementById("reset-ok-button").addEventListener("click", () => {
            fakePageReload();
            this.shadowRoot.getElementById("password-reset-popup").style.display = "none";
        });
    };

    onVisible = () => {
        this.showPart("username");
        this.clearInputs();
    };

    #usernameCheck() {
        this.usernameInput.input.setCustomValidity("");
        if (!this.usernameInput.input.validity.valid)
            this.usernameInput.input.setCustomValidity("Username must be at least 3 characters long and less than 20.");
        this.usernameInput.input.reportValidity();
        return this.usernameInput.input.validity.valid;
    }

    #answersCheck() {
        this.firstAnswerInput.input.setCustomValidity("");
        this.secondAnswerInput.input.setCustomValidity("");

        if (!this.firstAnswerInput.input.validity.valid)
            this.firstAnswerInput.input.setCustomValidity("Answer cannot be empty");

        if (!this.secondAnswerInput.input.validity.valid)
            this.secondAnswerInput.input.setCustomValidity("Answer cannot be empty");

        this.secondAnswerInput.input.reportValidity();
        this.firstAnswerInput.input.reportValidity();

        return this.firstAnswerInput.input.validity.valid && this.secondAnswerInput.input.validity.valid;
    }

    #passwordsCheck() {
        this.passwordInput.input.setCustomValidity("");
        this.confirmPasswordInput.input.setCustomValidity("");
        if (!this.passwordInput.input.validity.valid)
            this.passwordInput.input.setCustomValidity("Password must be at least 6 characters long and less than 20.");
        if (this.passwordInput.input.value !== this.confirmPasswordInput.input.value)
            this.confirmPasswordInput.input.setCustomValidity("Passwords do not match.");
        this.confirmPasswordInput.input.reportValidity();
        this.passwordInput.input.reportValidity();
        return this.passwordInput.input.validity.valid && this.confirmPasswordInput.input.validity.valid;
    }

    async #fetchSecurityQuestionsForUser() {
        const username = this.usernameInput.input.value;
        const response = await fetchPostApi("/api/user/security-questions", {username});
        const data = await response.json();
        if (response.ok) {
            for (let i = 0; i < data.length; i++)
                this.shadowRoot.getElementById(`question-${i}`).innerText = data[i].question;
            this.showPart("question");
        } else {
            alert(data?.error ?? response.statusText);
        }
    }

    async #verifyAnswers() {
        const username = this.usernameInput.input.value;
        const firstAnswer = this.firstAnswerInput.input.value;
        const secondAnswer = this.secondAnswerInput.input.value;
        const body = {username, answers: [firstAnswer, secondAnswer]};
        const response = await fetchPostApi("/api/user/verify-answers", body);
        const data = await response.json();
        if (response.ok) {
            this.resetPasswordToken = data.resetPasswordToken;
            this.showPart("password");
        } else {
            alert(data?.error ?? response.statusText);
        }
    }

    async #resetPassword() {
        const password = this.passwordInput.input.value;
        const body = JSON.stringify({newPassword: password});
        const response = await fetchApi("/api/user/reset-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + this.resetPasswordToken
            },
            body: body
        }, false);
        const data = await response.json();
        if (response.ok) {
            storeTokens(data);
            this.shadowRoot.getElementById("password-reset-popup").style.display = "block";
        } else {
            alert(data?.error ?? response.statusText);
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
            if (element.input) element.input.value = "";
        });
    }
}
