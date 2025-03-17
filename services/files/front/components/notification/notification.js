import {HTMLComponent} from "/js/component.js";

export class Notification extends HTMLComponent {
    static observedAttributes = ["message", "duration", "background", "color"];

    constructor() {
        super("notification", ["css"]);
    }

    show(message = null) {
        if (message) this.message = message;

        const notification = document.createElement("div");
        notification.textContent = this.message;
        notification.style.backgroundColor = this.background;
        notification.style.color = this.color;
        this.shadowRoot.appendChild(notification);

        setTimeout(() => notification.remove(), this.duration);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
    }
}
