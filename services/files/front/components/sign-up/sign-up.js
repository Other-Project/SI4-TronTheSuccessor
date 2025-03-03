import {HTMLComponent} from "/js/component.js";

export class SignUp extends HTMLComponent {

    constructor() {
        super("sign-up", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.shadowRoot.getElementById("sign-up").addEventListener("click", () => {
            if (!this.correctInputValues()) return;
            this.loginFetch("sign-up");
        });

        this.shadowRoot.getElementById("sign-in").addEventListener("click", () => {
            document.dispatchEvent(new CustomEvent("change-popup", {detail: {name: "sign-in"}}));
        });

        this.shadowRoot.getElementById("home").addEventListener("click", () => {
            document.dispatchEvent(new CustomEvent("menu-selection", {detail: "home"}));
        });

        this.shadowRoot.querySelector("form").addEventListener("submit", (event) => {
            event.preventDefault();
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
        const form = this.shadowRoot.querySelector("form");
        const username = this.shadowRoot.getElementById("username");
        const password = this.shadowRoot.getElementById("password");
        username.setCustomValidity("");
        password.setCustomValidity("");
        if (!username.validity.valid) username.setCustomValidity("Username must be at least 3 characters long and contain only letters and numbers.");
        if (!password.validity.valid) password.setCustomValidity("Password must be at least 6 characters long and contain only letters and numbers.");
        username.reportValidity();
        password.reportValidity();
        return form.checkValidity();
    }
}
