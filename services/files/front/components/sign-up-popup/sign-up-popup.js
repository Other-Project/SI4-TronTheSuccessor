import {HTMLComponent} from "/js/component.js";
import {loginFetch} from "/js/login-manager.js";

export class SignUpPopup extends HTMLComponent {

    constructor() {
        super("sign-up-popup", ["html", "css"]);
    }

    onSetupCompleted = async () => {
        await this.#injectSecurityQuestions();

        this.shadowRoot.getElementById("right-arrow").addEventListener("click", () => {
            this.#showPage("second-page");
        });

        this.shadowRoot.getElementById("left-arrow").addEventListener("click", () => {
            this.#showPage("first-page");
        });

        this.shadowRoot.getElementById("login").addEventListener("click", async () => {
            if (!this.#checkFirstPageInputs()) return;
            if (!this.#checkSecondPageInputs()) return;
            await this.#fetchLogin();
        });

        this.shadowRoot.getElementById("link").addEventListener("click", () => {
            document.dispatchEvent(new CustomEvent("change-popup", {detail: {name: "sign-in"}}));
        });
    };

    async #fetchLogin() {
        const first_question = this.shadowRoot.getElementById("first-security-question");
        const first_question_text = first_question.options[first_question.selectedIndex].text;
        const second_question = this.shadowRoot.getElementById("second-security-question");
        const second_question_text = second_question.options[second_question.selectedIndex].text;
        const body = JSON.stringify({
            username: this.shadowRoot.getElementById("username-input").shadowRoot.getElementById("answer").value,
            password: this.shadowRoot.getElementById("password-input").shadowRoot.getElementById("answer").value,
            securityQuestions: [
                {
                    question: first_question_text,
                    answer: this.shadowRoot.getElementById("first-answer-input").shadowRoot.getElementById("answer").value
                },
                {
                    question: second_question_text,
                    answer: this.shadowRoot.getElementById("second-answer-input").shadowRoot.getElementById("answer").value
                }
            ]
        });
        const data = await loginFetch("sign-up", body);
        document.cookie = `refreshToken=${data.refreshToken}; path=/; max-age=${60 * 60 * 24 * 7};`;
        document.cookie = `accessToken=${data.accessToken}; path=/; max-age=${60 * 60};`;
        location.reload();
    }

    #checkFirstPageInputs() {
        const username = this.shadowRoot.getElementById("username-input").shadowRoot.getElementById("answer");
        const password = this.shadowRoot.getElementById("password-input").shadowRoot.getElementById("answer");
        const confirmPassword = this.shadowRoot.getElementById("confirm-password-input").shadowRoot.getElementById("answer");

        username.setCustomValidity("");
        password.setCustomValidity("");
        confirmPassword.setCustomValidity("");

        if (!username.validity.valid)
            username.setCustomValidity("Username must be at least 3 characters long and less than 20.");

        if (!password.validity.valid)
            password.setCustomValidity("Password must be at least 6 characters long and less than 20.");

        if (!confirmPassword.validity.valid)
            confirmPassword.setCustomValidity("Please confirm your password.");

        if (password.value !== confirmPassword.value)
            confirmPassword.setCustomValidity("Passwords do not match.");

        if (!username.checkValidity() || !password.checkValidity() || !confirmPassword.checkValidity())
            this.#showPage("first-page");

        confirmPassword.reportValidity();
        password.reportValidity();
        username.reportValidity();

        return username.validity.valid &&
            password.validity.valid &&
            confirmPassword.validity.valid;
    }

    #checkSecondPageInputs() {
        const firstSecurityAnswer = this.shadowRoot.getElementById("first-answer-input").shadowRoot.getElementById("answer");
        const secondSecurityAnswer = this.shadowRoot.getElementById("second-answer-input").shadowRoot.getElementById("answer");

        if (firstSecurityAnswer == null || secondSecurityAnswer == null) {
            this.#showPage("second-page");
            return;
        }

        firstSecurityAnswer.setCustomValidity("");
        secondSecurityAnswer.setCustomValidity("");

        if (!firstSecurityAnswer.validity.valid)
            firstSecurityAnswer.setCustomValidity("Please provide an answer to the first security question.");

        if (!secondSecurityAnswer.validity.valid)
            secondSecurityAnswer.setCustomValidity("Please provide an answer to the second security question.");

        if (!firstSecurityAnswer.checkValidity() || !secondSecurityAnswer.checkValidity())
            this.#showPage("second-page");

        if (this.shadowRoot.getElementById("first-security-question").value === this.shadowRoot.getElementById("second-security-question").value)
            firstSecurityAnswer.setCustomValidity("Please choose two different questions");

        secondSecurityAnswer.reportValidity();
        firstSecurityAnswer.reportValidity();

        return firstSecurityAnswer.validity.valid && secondSecurityAnswer.validity.valid;
    }

    #showPage(page_name) {
        this.shadowRoot.querySelectorAll(".first-page").forEach(element => element.style.display = page_name === "first-page" ? "block" : "none");
        this.shadowRoot.querySelectorAll(".second-page").forEach(element => element.style.display = page_name === "second-page" ? "block" : "none");
    }

    async #injectSecurityQuestions() {
        const securityQuestions = await loginFetch("security-questions", null);
        const firstQuestion = this.shadowRoot.getElementById("first-security-question");
        const secondQuestion = this.shadowRoot.getElementById("second-security-question");

        for (let i = 0; i < securityQuestions.length; i++) {
            let opt = document.createElement("option");
            opt.value = i;
            opt.innerHTML = securityQuestions[i];
            firstQuestion.appendChild(opt);
            secondQuestion.appendChild(opt.cloneNode(true));
        }
    }
}
