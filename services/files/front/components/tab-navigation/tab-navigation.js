import {HTMLComponent} from "/js/component.js";

export class TabNavigation extends HTMLComponent {
    readonly;

    static get observedAttributes() {
        return ["readonly"];
    }

    constructor() {
        super("tab-navigation", ["html", "css"]);
    }

    onSetupCompleted = () => {
        this.tabsContainer = this.shadowRoot.getElementById("tabs-container");
        this.tabs = this.shadowRoot.getElementById("tabs");
        this.panels = this.shadowRoot.getElementById("panels");
        this.panelTemplate = this.shadowRoot.getElementById("panel-template");
        this.tabs.onmousedown = function (e) {
            if (e.button === 1) {
                e.preventDefault();
                return false; // Prevent middle-click from scrolling
            }
        };
        this.newtabBtn = this.shadowRoot.getElementById("new-tab-btn");
        this.newtabBtn.addEventListener("click", () => this.newTab());
    };

    onVisible = () => {
        const tab = this.tabs.querySelector("[data-tab-id].active") ?? this.tabs.querySelector("[data-tab-id]");
        if (tab) this.changeTab(tab.dataset.tabId);
        else this.newTab();
    };

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        this.#refresh();
    }

    #refresh() {
        if (!this.tabsContainer) return;
        this.tabsContainer.classList.toggle("readonly", this.readonly);
    }

    /**
     * Navigate to a specific page
     * @param {string} tabId The tab id to display
     */
    changeTab(tabId) {
        if (this.tabs.querySelector(`[data-tab-id="${tabId}"]`) === null) return;
        for (let tab of this.tabs.children) tab.classList.toggle("active", tab.dataset.tabId === tabId);
        for (let panel of this.panels.children) panel.classList.toggle("active", panel.id === "tab-" + tabId);
        this.tabs.querySelector(".active").scrollIntoView({behavior: "smooth"});
    }

    /**
     * Create a new tab
     * @param {boolean} navigateTo If true, navigate to the new tab
     */
    newTab(navigateTo = true) {
        if (this.readonly) return;
        const tabId = Math.random().toString(36).substring(7);

        const tabPanel = this.panelTemplate.assignedElements()?.[0]?.cloneNode(true);
        if (!tabPanel) return;
        tabPanel.id = "tab-" + tabId;
        this.panels.appendChild(tabPanel);

        const tabBtn = document.createElement("button");
        tabBtn.textContent = tabPanel.dataset.tabTitle;
        tabBtn.dataset.tabId = tabId;
        tabBtn.addEventListener("click", () => this.changeTab(tabId));
        tabBtn.addEventListener("mousedown", (e) => {
            if (e.button === 1) this.closeTab(tabId);
        });
        this.tabs.appendChild(tabBtn);

        const tabCloseBtn = document.createElement("button");
        tabCloseBtn.classList.add("close-btn");
        tabCloseBtn.textContent = "x";
        tabCloseBtn.addEventListener("click", e => {
            e.preventDefault();
            this.closeTab(tabId);
        });
        tabBtn.appendChild(tabCloseBtn);

        this.#setupTabTitleObserver(tabPanel, tabBtn);
        if (navigateTo) this.changeTab(tabId);
    }

    #setupTabTitleObserver(tabPanel, tabBtn) {
        new MutationObserver(() => tabBtn.textContent = tabPanel.dataset.tabTitle).observe(tabPanel, {
            attributes: true,
            attributeFilter: ["data-tab-title"]
        });
    }

    /**
     * Close a specific tab
     * @param {string} tabId The tab id to close
     */
    closeTab(tabId) {
        if (this.readonly) return;
        const tab = this.tabs.querySelector(`[data-tab-id="${tabId}"]`);
        const panel = this.panels.querySelector(`#tab-${tabId}`);

        if (tab?.classList.contains("active")) {
            const nextTab = tab.nextElementSibling ?? tab.previousElementSibling;
            if (nextTab?.dataset.tabId) this.changeTab(nextTab.dataset.tabId);
            else this.newTab();
        }

        tab?.remove();
        panel?.remove();
    }
}