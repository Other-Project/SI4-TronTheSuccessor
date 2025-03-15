import {HTMLComponent} from "/js/component.js";
import {fetchApi, getAccessToken, getUserInfo, renewAccessToken} from "/js/login-manager.js";

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
    };

    onHidden = () => {
        this.socket.disconnect();
        this.socket = null;
    };

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        this.#refresh();
    }

    #refresh() {
        if (!this.messagePanel) return;
        this.getMessages().then(messages => this.#displayMessages(messages));
        this.#openWebSocket().then();
    }

    #displayMessages(messages) {
        this.messagePanel.innerHTML = "";
        for (const message of messages) this.#displayMessage(message);
    }

    #displayMessage(message) {
        const messageElement = document.createElement("app-chat-room-message");
        messageElement.setAttribute("author", message.author);
        messageElement.setAttribute("content", message.content);
        messageElement.setAttribute("date", message.date);
        messageElement.setAttribute("type", message.type);
        messageElement.setAttribute("you", (message.author === getUserInfo()?.username).toString());
        this.messagePanel.appendChild(messageElement);
    }

    async #openWebSocket(retry = true) {
        if (this.socket) this.socket.disconnect();
        this.socket = io("/api/chat", {
            extraHeaders: {authorization: "Bearer " + await getAccessToken()},
            path: "/ws"
        });
        this.socket.on("connect_error", async (err) => {
            if (retry && err.message === "Authentication needed") {
                await renewAccessToken();
                this.#openWebSocket(false).then();
            } else console.error(err.message);
        });
        this.socket.on("message", (message) => this.#displayMessage(message));
        this.socket.emit("join", this.room);
    }

    async getMessages() {
        const response = await fetchApi(`/api/chat/${this.room}`);
        return await response.json();
    }

    async sendMessage() {
        const messageContent = this.messageInput.value;
        if (!messageContent) return;

        const message = {
            type: "text",
            content: messageContent
        };

        const ok = await new Promise(resolve => this.socket.timeout(5000).emit("message", message, (err, ack) => resolve(!err && ack)));
        if (ok) this.messageInput.value = "";
        else alert("Failed to send message");
    }
}
