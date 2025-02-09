import {HTMLComponent} from "/js/component.js";

export class HelpPage extends HTMLComponent {
    against = "local";

    static get observedAttributes() {
        return ["against"];
    }

    constructor() {
        super("help-page", ["html"]);
        document.addEventListener("keyup", async (event) => {
            if (event.code === "Space" && this.checkVisibility()) {
                const isValid = await this.#checkSessionValidity();
                if (!isValid) {
                    alert("Your session has expired. Please log in again.");
                    location.reload();
                    return;
                }
                document.dispatchEvent(new CustomEvent("menu-selection", {
                    detail: {
                        name: "game",
                        attr: {against: this.against}
                    }
                }));
            }
        });
    }

    onSetupCompleted = () => {
        this.controls = this.shadowRoot.getElementById("controls");
        this.#refresh();
    };

    attributeChangedCallback(name, oldValue, newValue) {
        this[name] = newValue;
        this.#refresh();
    }

    #refresh() {
        if (!this.controls) return;
        this.controls.querySelector("[owner=\"2\"]").style.display = this.against === "local" ? "block" : "none";
    }

    async #checkSessionValidity() {
        const sessionToken = this.getCookie("sessionToken");
        if (!sessionToken) {
            return false;
        }
        try {
            const response = await fetch("/api/user/check-token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({sessionToken: sessionToken}),
            });
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            return data.valid;
        } catch (error) {
            console.error("Error checking session token:", error);
            return false;
        }
    }
}