import {HTMLComponent} from "/js/component.js";

export class SignIn extends HTMLComponent {
    constructor() {
        super("sign-in", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.shadowRoot.getElementById("link").addEventListener("click", () => {
            document.dispatchEvent(new CustomEvent("change-popup", {
                detail: {name: "sign-up"}
            }))
        });

        this.shadowRoot.getElementById("login").addEventListener("click", () => {
            const username = this.shadowRoot.getElementById("username").value;
            const password = this.shadowRoot.getElementById("password").value;
            fetch("/api/user/sign-in", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({username, password})
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    response.json().then((data) => {
                        alert(data.error);
                    });
                }
            }).then((data) => {
                if (data) {
                    document.cookie = `username=${data.username}`;
                    document.cookie = `accessToken=${data.accessToken}`;
                    document.cookie = `refreshToken=${data.refreshToken}`;
                    window.location.reload();
                }
            }).catch((error) => {
                console.error(error);
            });
        });
    }
}