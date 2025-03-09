import {HTMLComponent} from "/js/component.js";

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
        this.sendButton.onclick = this.sendMessage;
    };

    onVisible = () => this.#refresh();

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
            messageElement.setAttribute("you", (message.author === "user1").toString());
            this.messagePanel.appendChild(messageElement);
        }
    }

    async getMessages() {
        return [
            {
                "author": "user1",
                "content": "Hello world !",
                "date": "2025-03-09T12:00:00",
                "type": "text"
            },
            {
                "author": "user2",
                "content": "Hi !",
                "date": "2025-03-09T12:01:00",
                "type": "text"
            },
            {
                "author": "user1",
                "content": "A very long message that should be displayed on multiple lines to test the layout of the chat room component.\nBut it's not a problem, the component should handle it properly.",
                "date": "2025-03-09T13:00:00",
                "type": "text"
            }
        ];

        // TODO
        /*const response = await fetch(`/api/chat/${this.room}`);
        return await response.json();*/
    }

    async sendMessage() {
        const message = this.messageInput.value;
        if (!message) return;

        // TODO

        this.messageInput.value = "";
    }
}