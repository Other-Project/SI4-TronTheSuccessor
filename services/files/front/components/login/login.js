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

        this.shadowRoot.querySelector("form").addEventListener("submit", (event) => {
            event.preventDefault();
        });
    }

    async loginFetch(url) {
        const response = await fetch("/api/user/" + url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: this.shadowRoot.getElementById("username").value,
                password: this.shadowRoot.getElementById("password").value
            })
        });
        const data = await response.json();
        if (!response.ok) {
            alert(data?.error ?? response.statusText);
            return;
        }

        const user = this.parseJwt(data.accessToken);
        alert("Logged in as " + user.username);
        document.cookie = `refreshToken=${data.refreshToken}; path=/; max-age=${60 * 60 * 24 * 7};`;
        document.cookie = `accessToken=${data.accessToken}; path=/; max-age=${60 * 60};`;
    }

    parseJwt(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        return JSON.parse(jsonPayload);
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
