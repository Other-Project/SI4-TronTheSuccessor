import {HTMLComponent} from '/js/component.js';

export class Notification extends HTMLComponent {
    constructor() {
        super("notification", ["css"]);
    }

    connectedCallback() {
        document.addEventListener("show-notification", (event) => {
            const {message, duration, background, color} = event.detail;
            this.show(message, duration, background, color);
        });
    }

    show(message, duration = 2000, background = "#333", color = "#fff") {
        this.shadowRoot.innerHTML = "";
        const notification = document.createElement("div");
        notification.textContent = message;
        notification.style.backgroundColor = background;
        notification.style.color = color;
        this.shadowRoot.appendChild(notification);

        setTimeout(() => notification.remove(), duration);
    }
}

const notificationElement = document.createElement('app-notification');
document.body.appendChild(notificationElement);
