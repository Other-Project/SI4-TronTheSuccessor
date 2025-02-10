import {HTMLComponent} from "/js/component.js";

export class Login extends HTMLComponent {

    constructor() {
        super("login", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.shadowRoot.getElementById("sign-in").addEventListener("click", () => {
            if (!this.correctInputValues()) return;
            this.loginFetch("sign-in");
        });

        this.shadowRoot.getElementById("sign-up").addEventListener("click", () => {
            if (!this.correctInputValues()) return;
            this.loginFetch("sign-up");
        });

        this.shadowRoot.getElementById("home").addEventListener("click", () => {
            document.dispatchEvent(new CustomEvent("menu-selection", {detail: "home"}));
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
                password: this.shadowRoot.getElementById("password").value
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
                alert("Logged in as " + data.username);
                document.cookie = `refreshToken=${data.refreshToken}; path=/; max-age=${60 * 60 * 24 * 7};`;
                document.cookie = `accessToken=${data.accessToken}; path=/; max-age=${60 * 60};`;
            }
        }).catch(error => {
            alert(error.message);
        });
    }

    correctInputValues() {
        const username = this.shadowRoot.getElementById("username");
        const password = this.shadowRoot.getElementById("password");
        let isValid = true;

        this.clearErrorMessages();

        if (!username.validity.valid) {
            this.showError(username, "Username must be at least 3 characters long and contain only letters and numbers.");
            isValid = false;
        }

        if (!password.validity.valid) {
            this.showError(password, "Password must be at least 6 characters long and contain only letters and numbers.");
            isValid = false;
        }
        return isValid;
    }

    showError(input, message) {
        const errorElement = document.createElement("div");
        errorElement.className = "error-message";
        errorElement.style.color = "red";
        errorElement.textContent = message;
        input.parentNode.insertBefore(errorElement, input.nextSibling);
    }

    clearErrorMessages() {
        const errorMessages = this.shadowRoot.querySelectorAll(".error-message");
        errorMessages.forEach(error => error.remove());
    }
}