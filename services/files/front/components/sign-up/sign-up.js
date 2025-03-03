import {HTMLComponent} from "/js/component.js";

export class SignUp extends HTMLComponent {

    constructor() {
        super("sign-up", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.shadowRoot.getElementById("login").addEventListener("click", () => {
            if (!this.correctInputValues()) return;
            this.loginFetch("sign-up");
        });

        this.shadowRoot.getElementById("link").addEventListener("click", () => {
            document.dispatchEvent(new CustomEvent("change-popup", {detail: {name: "sign-in"}}));
        });
    }

    loginFetch(url) {
        fetch("/api/user/" + url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
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
            })
        }).then(response => {
            if (response.ok)
                return response.json();
            else {
                throw new Error(response.statusText);
            }
        }).then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                document.cookie = `refreshToken=${data.refreshToken}; path=/; max-age=${60 * 60 * 24 * 7};`;
                document.cookie = `accessToken=${data.accessToken}; path=/; max-age=${60 * 60};`;
                document.cookie = `username=${data.username}; path=/; max-age=${60 * 60};`;
                location.reload();
            }
        }).catch(error => {
            alert(error.message);
        });
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
}
