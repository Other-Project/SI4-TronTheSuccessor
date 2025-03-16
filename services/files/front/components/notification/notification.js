import {HTMLComponent} from "/js/component.js";

export class Notification extends HTMLComponent {
    static observedAttributes = ['message', 'duration', 'background'];

    constructor() {
        super('notification');
    }

    show(message = null) {
        if (message) this.message = message;

        const notification = document.createElement("div");
        notification.textContent = this.message;
        notification.style.position = "fixed";
        notification.style.bottom = "20px";
        notification.style.left = "50%";
        notification.style.transform = "translateX(-50%)";
        notification.style.backgroundColor = this.background;
        notification.style.color = this.text;
        notification.style.padding = "10px 20px";
        notification.style.borderRadius = "5px";
        notification.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)";
        notification.style.zIndex = "1000";
        this.shadowRoot.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, this.duration);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        this.show();
    }
}
