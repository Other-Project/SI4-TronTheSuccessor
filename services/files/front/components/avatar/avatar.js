import {HTMLComponent} from "/js/component.js";
import "/js/capacitor.min.js";

export class Avatar extends HTMLComponent {
    avatar;

    static get observedAttributes() {
        return ["avatar", "username"];
    }

    constructor() {
        super("avatar", ["css"]);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "username") this.avatar = `/api/user/${newValue}/avatar`;
        if (name === "avatar") this.avatar = `/assets/avatars/${newValue}.svg`;
        this.#refresh();
    }

    onSetupCompleted = () => this.#refresh();

    #refresh() {
        if (!this.avatar) this.shadowRoot.replaceChildren();
        const image = document.createElement("div");
        const url = Capacitor.isNativePlatform() ? new URL(this.avatar, "https://tronsuccessor.ps8.pns.academy").toString() : this.avatar;
        image.style.backgroundImage = `url("${url}")`;
        this.shadowRoot.replaceChildren(image);
    }
}
