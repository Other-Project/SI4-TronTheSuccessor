import {HTMLComponent} from "/js/component.js";

export class TabNavigation extends HTMLComponent {
    constructor() {
        super("tab-navigation", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.tabs = this.shadowRoot.getElementById("tabs");
        this.panels = this.shadowRoot.getElementById("panels");
        this.tabs.onmousedown = function (e) {
            if (e.button === 1) {
                e.preventDefault();
                return false; // Prevent middle-click from scrolling
            }
        };
        this.shadowRoot.getElementById("new-tab-btn").addEventListener("click", () => this.newTab());
    };

    onVisible = () => {
        this.newTab();
        this.newTab();
    };

    /**
     * Navigate to a specific page
     * @param {string} tabId The tab id to display
     */
    changeTab(tabId) {
        if (this.tabs.querySelector(`[data-tab-id="${tabId}"]`) === null) return;
        for (let tab of this.tabs.children) tab.classList.toggle("active", tab.dataset.tabId === tabId);
        for (let panel of this.panels.children) panel.classList.toggle("active", panel.id === "tab-" + tabId);
        this.tabs.querySelector(".active").scrollIntoView({ behavior: "smooth" });
    }

    /**
     * Create a new tab
     * @param {boolean} navigateTo If true, navigate to the new tab
     */
    newTab(navigateTo = true) {
        const tabId = Math.random().toString(36).substring(7);

        const tabBtn = document.createElement("button");
        tabBtn.textContent = "Tab " + tabId;
        tabBtn.dataset.tabId = tabId;
        tabBtn.addEventListener("click", () => this.changeTab(tabId));
        tabBtn.addEventListener("mousedown", (e) => {
            if (e.button === 1) this.closeTab(tabId);
        });
        const tabCloseBtn = document.createElement("button");
        tabCloseBtn.textContent = "x";
        tabCloseBtn.addEventListener("click", e => {
            e.preventDefault();
            this.closeTab(tabId);
        });
        tabBtn.appendChild(tabCloseBtn);
        this.tabs.appendChild(tabBtn);

        const tabPanel = document.createElement("div");
        tabPanel.id = "tab-" + tabId;
        tabPanel.textContent = "Content " + tabId;
        this.panels.appendChild(tabPanel);

        if (navigateTo) this.changeTab(tabId);
    }

    /**
     * Close a specific tab
     * @param {string} tabId The tab id to close
     */
    closeTab(tabId) {
        const tab = this.tabs.querySelector(`[data-tab-id="${tabId}"]`);
        const panel = this.panels.querySelector(`#tab-${tabId}`);

        if (tab?.classList.contains("active")) {
            const nextTab = tab.nextElementSibling ?? tab.previousElementSibling;
            if (nextTab) this.changeTab(nextTab.dataset.tabId);
            else this.newTab();
        }

        tab?.remove();
        panel?.remove();
    }
}