import {HTMLComponent} from "/js/component.js";

export class Login extends HTMLComponent {

    //TODO : Add an icon to the home page

    constructor() {
        super("login", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.shadowRoot.getElementById("sign-in").addEventListener("click", () => {
            this.loginFetch("sign-in");
        });

        this.shadowRoot.getElementById("sign-up").addEventListener("click", () => {
            this.loginFetch("sign-up");
        });

        this.shadowRoot.getElementById("accueil").addEventListener("click", () => {
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
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("Invalid credentials");
            }
        }).then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                alert("Logged in as " + data.username);
                if (data.permanentToken) {
                    document.cookie = `permanentToken=${data.permanentToken}; path=/; max-age=${60 * 60 * 24 * 365};`;
                }
                document.cookie = `sessionToken=${data.sessionToken}; path=/; max-age=${60 * 60};`;
            }
        }).catch(error => {
            alert(error.message);
        });
    }
}
