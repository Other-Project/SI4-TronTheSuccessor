import {HTMLComponent} from "/js/component.js";
import {fetchApi, getAccessToken, getUserInfo, renewAccessToken} from "/js/login-manager.js";

export class ChatRoom extends HTMLComponent {
    /** @type {string} */ room;
    /** @type {Array} */ messages = [];

    constructor() {
        super("chat-room", ["html", "css"]);
    }

    static get observedAttributes() {
        return ["room", "pending", "friend"];
    }

    onSetupCompleted = () => {
        this.messagePanel = this.shadowRoot.getElementById("messages");
        this.messagesWrap = this.shadowRoot.getElementById("messages-wrap");
        this.messageInput = this.shadowRoot.getElementById("message-input");
        this.sendButton = this.shadowRoot.getElementById("send");
        this.notificationBanner = this.shadowRoot.getElementById("notification-banner");
        this.notificationMessage = this.shadowRoot.getElementById("notification-message");
        this.acceptRequestButton = this.shadowRoot.getElementById("accept-request");
        this.refuseRequestButton = this.shadowRoot.getElementById("refuse-request");
        this.notificationActionButton = this.shadowRoot.getElementById("notification-actions");
        this.sendButton.onclick = () => this.sendMessage();
        this.acceptRequestButton.onclick = () => this.handleFriendRequest("POST");
        this.refuseRequestButton.onclick = () => this.handleFriendRequest("DELETE");
        this.messagesWrap.addEventListener("scroll", this.handleScroll);
    };

    onVisible = () => {
        this.#refresh();
    };

    onHidden = () => {
        if (this.socket) this.socket.disconnect();
        this.socket = null;
    };

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        this.#refresh();
    }

    handleScroll = async () => {
        if (-this.messagesWrap.scrollTop + this.messagesWrap.clientHeight + 50 >= this.messagesWrap.scrollHeight) {
            this.messagesWrap.onscroll = null;
            await this.loadMoreMessages();
            this.messagesWrap.onscroll = this.handleScroll;
        }
    };

    #refresh() {
        if (!this.messagePanel) return;
        if (this.messages.length === 0)
            this.#fetchMessages().then(() => this.#displayMessages());
        else
            this.#displayMessages();
        this.messageInput.disabled = this.sendButton.button.disabled = this.friend === "false";
        const showNotification = this.pending !== "undefined" || this.friend === "false";
        this.messageInput.title = this.sendButton.title = showNotification ? "You need to be friends to send messages" : "";
        this.notificationBanner.classList.toggle("hidden", !showNotification);
        this.notificationActionButton.classList.toggle("hidden", this.pending === "undefined" || this.pending === getUserInfo()?.username);

        if (this.pending !== "undefined")
            this.notificationMessage.textContent = this.pending === getUserInfo()?.username
                ? `Your friend request has not been accepted yet,  You can't send messages until they accept it.`
                : `${this.pending} has sent you a friend request. You can't send messages until you accept it.`;
        else if (this.friend === "false")
            this.notificationMessage.textContent = `You need to be friends with ${this.room} to send messages.`;
        else this.#openWebSocket().then();
    }

    #displayMessages() {
        this.messagePanel.innerHTML = "";
        for (const message of this.messages) this.#displayMessage(message);
    }

    async loadMoreMessages() {
        if (this.messages.length === 0) return;
        const oldestMessage = this.messages[0];
        const before = oldestMessage.date;
        const response = await fetchApi(`/api/chat/${this.room}?before=${encodeURIComponent(before)}`);
        if (!response.ok) {
            this.#showNotification("Error fetching older messages", 2000, "red", "white");
            return;
        }
        const olderMessages = await response.json();
        this.messages = [...olderMessages, ...this.messages];
        this.#displayMessages();
        this.messagesWrap.scrollTop += 100;
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
        this.socket.on("message", (message) => {
            this.messages.push(message);
            this.#displayMessage(message);
        });
        this.socket.emit("join", this.room);
    }

    async #fetchMessages() {
        const response = await fetchApi(`/api/chat/${this.room}`);
        if (response.ok)
            this.messages = await response.json();
        else {
            this.#showNotification("Error fetching messages", 2000, "red", "white");
            this.messages = [];
        }
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

    #showNotification(message, duration, background, color) {
        document.dispatchEvent(new CustomEvent("show-notification", {
            detail: {
                message: message,
                duration: duration,
                background: background,
                color: color
            }
        }));
    }

    async handleFriendRequest(method) {
        this.notificationBanner.classList.add("hidden");
        const endpoint = `/api/user/friends/${this.pending}`;
        const response = await fetchApi(endpoint, {method: method});
        const message = method === "POST" ? "Friend request accepted!" : "Friend request refused!";

        if (response.ok)
            this.#showNotification(message, 2000, "#8E24AA", "white");
        else {
            const error = await response.json();
            this.#showNotification(`Error: ${error.error}`, 2000, "red", "white");
        }

        this.dispatchEvent(new CustomEvent("friendRequestHandled", {
            bubbles: true,
            composed: true,
            detail: {friend: this.pending, method: method}
        }));
    }
}
