import {HTMLComponent} from "/js/component.js";
import {fetchApi} from "/js/login-manager.js";
import notificationService from "/js/notification.js";

export class ChatSelection extends HTMLComponent {
    constructor() {
        super("chat-selection", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.shadowRoot.getElementById("global").addEventListener("click", () => this.openChatRoom("global", "Global"));
        this.friendListPanel = this.shadowRoot.getElementById("friend-list");
        notificationService.addEventListener("friend-status-update", this.#updateFriendStatus);
        notificationService.addEventListener("unread-notification", this.#updateMessageNotification);
        notificationService.addEventListener("refresh-friend-list", this.onVisible);
    }

    onVisible = async () => {
        this.friendList = await this.#getFriendList();
        this.#updateFriendListPanel();
    };

    openChatRoom(roomId, roomName, pending, friend) {
        notificationService.readNotification(roomId);
        this.currentRoom = {id: roomId};
        this.dispatchEvent(new CustomEvent("room-selected", {
            detail: {
                id: roomId,
                name: roomName,
                pending: pending,
                friend: friend
            }
        }));
    }

    #updateFriendListPanel() {
        this.friendListPanel.innerHTML = "";
        const sortedFriends = this.#sortFriendsByPriority(this.friendList);
        for (let friend of sortedFriends) {
            const friendButton = document.createElement("app-chat-room-button");
            friendButton.id = `friend-${friend.id}`;
            friendButton.setAttribute("icon", friend.icon);
            friendButton.setAttribute("roomId", friend.id);
            friendButton.setAttribute("name", friend.name);
            friendButton.setAttribute("preview", friend.preview);
            friendButton.setAttribute("connected", notificationService.getConnectedFriends().includes(friend.name));
            friendButton.setAttribute("unread", notificationService.getUnreadNotifications().includes(friend.name));
            friendButton.setAttribute("friend", friend.friend);
            friendButton.addEventListener("click", () => this.openChatRoom(friend.id, friend.name, friend.pending, friend.friend));
            this.friendListPanel.appendChild(friendButton);
            if (this.currentRoom?.id === friend.id) this.openChatRoom(friend.id, friend.name, friend.pending, friend.friend);
        }
    }

    /**
     * Fetches the friend list from the server
     * @returns {Promise<{id: string, name: string, preview: string, icon: string|null, pending: boolean, friend: boolean}[]>}
     */
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

    #updateFriendStatus = (event) => {
        const {friend, connected} = event.detail;
        const friendButton = this.shadowRoot.getElementById(`friend-${friend}`);
        if (friendButton) friendButton.setAttribute("connected", connected);

        if (connected && friendButton !== this.friendListPanel.firstElementChild) this.friendListPanel.prepend(friendButton);
        else if (friendButton !== this.friendListPanel.lastElementChild) this.friendListPanel.appendChild(friendButton);
    };

    #updateMessageNotification = (event) => {
        const {friend} = event.detail;
        const friendButton = this.shadowRoot.getElementById(`friend-${friend}`);
        if (friendButton) friendButton.setAttribute("unread", "true");

        if (friendButton !== this.friendListPanel.firstElementChild) this.friendListPanel.prepend(friendButton);
    };

    /**
     * Sorts the friend list by priority: unread messages first, then online friends, then others
     * @param {{id: string, name: string, preview: string, icon: string|null, pending: boolean, friend: boolean}[]} friendList - The list of friends to sort
     * @returns {{id: string, name: string, preview: string, icon: string|null, pending: boolean, friend: boolean}[]}
     */
    #sortFriendsByPriority(friendList) {
        return [...friendList].sort((a, b) => {
            const aHasUnread = notificationService.getUnreadNotifications().includes(a.name);
            const bHasUnread = notificationService.getUnreadNotifications().includes(b.name);
            const aIsConnected = notificationService.getConnectedFriends().includes(a.name);
            const bIsConnected = notificationService.getConnectedFriends().includes(b.name);

            if (aHasUnread && !bHasUnread) return -1;
            if (!aHasUnread && bHasUnread) return 1;

            if (aIsConnected && !bIsConnected) return -1;
            if (!aIsConnected && bIsConnected) return 1;

            return 0;
        });
    }
}
