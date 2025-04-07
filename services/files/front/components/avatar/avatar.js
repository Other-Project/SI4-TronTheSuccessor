import {HTMLComponent} from "/js/component.js";

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
        image.style.backgroundImage = `url("${this.avatar}")`;
        this.shadowRoot.replaceChildren(image);
    }
}
