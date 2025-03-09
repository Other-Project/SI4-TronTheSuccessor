import {HTMLComponent} from "/js/component.js";
import {fetchApi, getUserInfo} from "/js/login-manager.js";

export class ChatRoom extends HTMLComponent {
    /** @type {string} */ room;

    static get observedAttributes() {
        return ["room"];
    }

    constructor() {
        super("chat-room", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.messagePanel = this.shadowRoot.getElementById("messages");
        this.messageInput = this.shadowRoot.getElementById("message-input");
        this.sendButton = this.shadowRoot.getElementById("send");
        this.sendButton.onclick = () => this.sendMessage();
    };

    onVisible = () => {
        this.#refresh();
        this.loopId = setInterval(() => this.#refresh(), 5000);
    };

    onHidden = () => {
        if (this.loopId) clearInterval(this.loopId);
        this.loopId = null;
    };

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        this.#refresh();
    }

    #refresh() {
        if (!this.messagePanel) return;
        this.getMessages().then(messages => this.#displayMessages(messages));
    }

    #displayMessages(messages) {
        this.messagePanel.innerHTML = "";
        for (const message of messages) {
            const messageElement = document.createElement("app-chat-room-message");
            messageElement.setAttribute("author", message.author);
            messageElement.setAttribute("content", message.content);
            messageElement.setAttribute("date", message.date);
            messageElement.setAttribute("type", message.type);
            messageElement.setAttribute("you", (message.author === getUserInfo()?.username).toString());
            this.messagePanel.appendChild(messageElement);
        }
    }

    async getMessages() {
        const response = await fetchApi(`/api/chat/${this.room}`);
        return await response.json();
    }

    async sendMessage() {
        const message = this.messageInput.value;
        if (!message) return;

        const response = await fetchApi(`/api/chat/${this.room}`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                type: "text",
                content: message
            })
        });
        if (response.ok) this.messageInput.value = "";
        else alert("Failed to send message");
    }
}
