import {HTMLComponent} from "/js/component.js";
import {fetchApi, getAccessToken, getUserInfo, renewAccessToken} from "/js/login-manager.js";

export class ChatRoom extends HTMLComponent {
    /** @type {string} */ room;

    constructor() {
        super("chat-room", ["html", "css"]);
    }

    static get observedAttributes() {
        return ["room", "pending", "friend"];
    }

    onSetupCompleted = () => {
        this.messagePanel = this.shadowRoot.getElementById("messages");
        this.messageInput = this.shadowRoot.getElementById("message-input");
        this.sendButton = this.shadowRoot.getElementById("send");
        this.notificationBanner = this.shadowRoot.getElementById("notification-banner");
        this.notificationMessage = this.shadowRoot.getElementById("notification-message");
        this.acceptRequestButton = this.shadowRoot.getElementById("accept-request");
        this.refuseRequestButton = this.shadowRoot.getElementById("refuse-request");
        this.notificationActionButton = this.shadowRoot.getElementById("notification-actions");

        this.messageInput.onkeydown = (event) => {
            if (event.key === "Enter") {
                if (event.shiftKey && this.messageInput.value.split("\n").length < 5) return;
                if (!event.shiftKey) this.sendMessage().then();
                event.preventDefault();
            }
        }
        this.messageInput.oninput = () => {
            const rows = this.messageInput.value.split("\n");
            if (rows.length > 5) this.messageInput.value = rows.slice(0, 5).join("\n");
            this.messageInput.style.height = '';
            this.messageInput.style.height = this.messageInput.scrollHeight + 'px';
        };
        this.sendButton.onclick = () => this.sendMessage();
        this.acceptRequestButton.onclick = () => this.handleFriendRequest("POST");
        this.refuseRequestButton.onclick = () => this.handleFriendRequest("DELETE");
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

    #refresh() {
        if (!this.messagePanel) return;
        this.getMessages().then(messages => this.#displayMessages(messages));
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

    #displayMessages(messages) {
        this.messagePanel.innerHTML = "";
        for (const message of messages) this.#displayMessage(message);
    }

    #displayMessage(message) {
        const messageElement = document.createElement("app-chat-room-message");
        messageElement.setAttribute("author", message.author);
        messageElement.setAttribute("type", message.type);
        messageElement.setAttribute("date", message.date);
        const sameAuthor = message.author === getUserInfo()?.username;
        messageElement.setAttribute("you", sameAuthor.toString());
        switch (message.type) {
            case "friend-request" :
            case "text":
                messageElement.setAttribute("content", message.content);
                break;
            case "game-invitation":
                const status = message.status;
                const isExpired = message.expiresAt && new Date() > new Date(message.expiresAt);
                let content;
                if (status === "accepted" || status === "refused" || status === "cancelled")
                    content = `Game invitation ${status}`;
                else if (isExpired)
                    content = "Game invitation expired";
                else {
                    messageElement.gameInvitationToken = message.gameInvitationToken;
                    content = sameAuthor ? "You sent a game invitation" : `${message.author} sent you a game invitation`;
                    if (!sameAuthor) messageElement.setAttribute("expired", isExpired.toString());
                }
                messageElement.setAttribute("content", content);
                break;
            default:
                console.warn(`Unknown message type: ${message.type}`);
        }
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
        const messageContent = this.messageInput.value.trim();
        if (!messageContent || messageContent.length < 2 || messageContent.length > 128 || messageContent.split("\n").length > 5)
            this.messageInput.setCustomValidity("Message must be between 2 and 128 characters and must not exceed 5 lines");
        else this.messageInput.setCustomValidity("");
        if (!this.messageInput.reportValidity()) return;

        const message = {
            type: "text",
            content: messageContent
        };

        const ok = await new Promise(resolve => this.socket.timeout(5000).emit("message", message, (err, ack) => resolve(!err && ack)));
        if (ok) {
            this.messageInput.value = "";
            this.messageInput.style.height = '';
        } else this.#showNotification("Failed to send message", 2000, "red", "white");
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
