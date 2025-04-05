import {HTMLComponent} from "/js/component.js";
import {fetchApi} from "/js/login-manager.js";
import notificationService from "/js/notification.js";

export class ChatSelection extends HTMLComponent {
    constructor() {
        super("chat-selection", ["html", "css"]);
        this.connectedFriends = [];
    }

    onSetupCompleted = () => {
        this.shadowRoot.getElementById("global").addEventListener("click", () => this.openChatRoom("global", "Global"));
        this.friendListPanel = this.shadowRoot.getElementById("friend-list");
        this.shadowRoot.addEventListener("friendRequestHandled", this.#refresh);
        notificationService.addEventListener("initialize-friend-status", this.#initializeFriendStatus);
        notificationService.addEventListener("friend-status-update", this.#updateFriendStatus);
    }

    onVisible = async () => {
        this.friendList = await this.#getFriendList();
        this.#updateFriendListPanel();
    };

    openChatRoom(roomId, roomName, pending, friend) {
        this.dispatchEvent(new CustomEvent("room-selected", {
            detail: {
                id: roomId,
                name: roomName,
                pending: pending,
                friend: friend
            }
        }));
    }

    #refresh = async (event) => {
        const friend = event?.detail?.friend;
        const method = event?.detail?.method;
        this.friendList = await this.#getFriendList();
        this.#updateFriendListPanel();
        this.openChatRoom(friend, friend, "undefined", method === "POST" ? "true" : "false");
    };

    #updateFriendListPanel() {
        this.friendListPanel.innerHTML = "";
        for (let friend of this.friendList) {
            const friendButton = document.createElement("app-chat-room-button");
            friendButton.id = `friend-${friend.id}`;
            friendButton.classList.add("friend-button");
            friendButton.setAttribute("icon", friend.icon ?? "/assets/profile.svg");
            friendButton.setAttribute("name", friend.name);
            friendButton.setAttribute("preview", friend.preview);
            friendButton.setAttribute("connected", this.connectedFriends.includes(friend.name));
            friendButton.addEventListener("click", () => this.openChatRoom(friend.id, friend.name, friend.pending, friend.friend));
            this.friendListPanel.appendChild(friendButton);
        }
    }

    async #getFriendList() {
        let chatRooms = await fetchApi(
            `/api/chat`,
            {method: "GET"}
        ).then(response => response.json());
        return chatRooms.map(friend => ({
            id: friend.username,
            name: friend.username,
            preview: friend.last,
            icon: null,
            pending: friend.pending,
            friend: friend.friend
        }));
    }

    #initializeFriendStatus = (event) => {
        const {connectedFriends} = event.detail;
        this.connectedFriends = connectedFriends;
        if (!this.friendList) return;

        for (let friend of this.connectedFriends) {
            const friendButton = this.shadowRoot.getElementById(`friend-${friend}`);
            if (friendButton) friendButton.setAttribute("connected", "true");
        }
    };

    #updateFriendStatus = (event) => {
        const {friend, connected} = event.detail;
        const friendButton = this.shadowRoot.getElementById(`friend-${friend}`);
        if (friendButton) friendButton.setAttribute("connected", connected);
    };
}
