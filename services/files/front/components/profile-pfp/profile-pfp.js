import {HTMLComponent} from "/js/component.js";
import "/js/capacitor.min.js";

export class ProfilePfp extends HTMLComponent {
    static get observedAttributes() {
        return ["src", "username"];
    }

    constructor() {
        super("profile-pfp", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.pfpElement = this.shadowRoot.getElementById("pfp");
        this.usernameElement = this.shadowRoot.getElementById("username");
    };

    onVisible = () => this.#refresh();

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        this.#refresh();
    }

    #refresh() {
        if (!this.pfpElement) return;
        this.pfpElement.src = Capacitor.isNativePlatform() ? new URL(this.src, "https://tronsuccessor.ps8.pns.academy").toString() : this.src;
        this.usernameElement.textContent = this.username;
    }
}
