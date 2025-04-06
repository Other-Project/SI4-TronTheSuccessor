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
        this.tabIdCounter = 0;
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

        this.panelSlot = this.panels.querySelector("slot");
        this.panelSlot.addEventListener("slotchange", () => this.#recreateTabs());
        this.#refresh();
        this.#recreateTabs();
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
        this.tabsContainer.classList.toggle("readonly", this.readonly === "true");
    }

    #getTabs() {
        return [...this.panelSlot.assignedElements(), ...this.panels.querySelectorAll(":not(slot)")];
    }

    #recreateTabs() {
        this.tabs.innerHTML = "";
        this.#getTabs().forEach(tabPanel => this.#createTabBtn(tabPanel));
    }

    /**
     * Navigate to a specific page
     * @param {string} tabId The tab id to display
     */
    changeTab(tabId = undefined) {
        const tabToActivate = this.tabs.querySelector(`[data-tab-id="${tabId}"]`);
        if (!tabToActivate) return;
        for (let tab of this.tabs.querySelectorAll("[data-tab-id]")) tab.classList.toggle("active", tab.dataset.tabId === tabId);
        for (let panel of this.#getTabs()) panel.classList.toggle("active", panel.id === tabId);
        tabToActivate.scrollIntoView({behavior: "smooth"});
    }

    /**
     * Create a new tab
     * @param {boolean} navigateTo If true, navigate to the new tab
     */
    newTab(navigateTo = true) {
        if (this.readonly === "true") return;
        const tabPanel = this.panelTemplate.assignedElements()?.[0]?.cloneNode(true);
        if (!tabPanel) return;
        tabPanel.id = "tab-" + (this.tabIdCounter++).toString();
        this.panels.appendChild(tabPanel);
        this.#createTabBtn(tabPanel);
        if (navigateTo) this.changeTab(tabPanel.id);
    }

    /**
     * Create a tab button for a tab panel
     * @param tabPanel The tab panel to create a tab button for
     */
    #createTabBtn(tabPanel) {
        const tabId = tabPanel.id;
        const tabBtn = document.createElement("button");
        const tabBtnText = document.createElement("span");
        tabBtnText.textContent = tabPanel.dataset.tabTitle ?? "New Tab";
        tabBtn.appendChild(tabBtnText);
        tabBtn.dataset.tabId = tabId;
        tabBtn.addEventListener("click", () => this.changeTab(tabId));
        tabBtn.addEventListener("mousedown", (e) => {
            if (e.button === 1) this.closeTab(tabId);
        });
        tabBtn.style.display = tabPanel.dataset.tabDisabled === "true" ? "none" : "";
        this.tabs.appendChild(tabBtn);

        const tabCloseBtn = document.createElement("button");
        tabCloseBtn.classList.add("close-btn");
        tabCloseBtn.textContent = "x";
        tabCloseBtn.addEventListener("click", e => {
            e.preventDefault();
            this.closeTab(tabId);
        });
        tabBtn.appendChild(tabCloseBtn);

        this.#setupTabTitleObserver(tabPanel, tabBtn, tabBtnText);
    }

    #setupTabTitleObserver(tabPanel, tabBtn, tabBtnText) {
        new MutationObserver(() => {
            tabBtnText.textContent = tabPanel.dataset.tabTitle ?? "New Tab";
            const isDisabled = tabPanel.dataset.tabDisabled === "true";
            tabBtn.style.display = isDisabled ? "none" : "";
            if (isDisabled && tabBtn.classList.contains("active")) this.switchToNextTab(tabBtn);
        }).observe(tabPanel, {
            attributes: true,
            attributeFilter: ["data-tab-title", "data-tab-disabled"]
        });
    }

    /**
     * Close a specific tab
     * @param {string} tabId The tab id to close
     */
    closeTab(tabId) {
        if (this.readonly) return;
        const tab = this.tabs.querySelector(`[data-tab-id="${tabId}"]`);
        const panel = tabId ? this.panels.querySelector(`#${tabId}`) : null;
        if (tab?.classList.contains("active") && !this.switchToNextTab(tab)) this.newTab();
        tab?.remove();
        panel?.remove();
    }

    /**
     * Switch to the next tab
     * @param {HTMLElement} tabBtn The tab button to switch from
     */
    switchToNextTab(tabBtn) {
        tabBtn ??= this.tabs.querySelector("[data-tab-id].active");
        const nextTab = tabBtn.nextElementSibling ?? tabBtn.previousElementSibling;
        if (nextTab?.dataset.tabId) this.changeTab(nextTab.dataset.tabId);
        else this.changeTab();
        return nextTab?.dataset.tabId;
    }
}
