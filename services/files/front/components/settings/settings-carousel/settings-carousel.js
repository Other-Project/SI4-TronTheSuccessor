import {HTMLComponent} from "/js/component.js";
import {loadAndCustomiseSVG} from "/js/svg-utils.js";
import {playerColors} from "/js/player.js";

export class SettingsCarousel extends HTMLComponent {
    #collection;

    constructor() {
        super("settings-carousel", ["html", "css"], "settings");
    }

    set collection(collection) {
        this.#collection = collection;
        this.#refresh().then();
    }

    onSetupCompleted = async () => {
        this.container = this.shadowRoot.querySelector(".container");
        this.template = this.shadowRoot.getElementById("item-template");
        await this.#refresh();
    };

    async #refresh() {
        if (!this.#collection || !this.container) return;

        const nodes = await Promise.all(this.#collection.map(async item => {
            const clone = this.template.content.cloneNode(true).firstElementChild;
            clone.classList.toggle("selected", item.selected);
            clone.classList.toggle("locked", !item.owned);

            const templateImg = clone.querySelector(".image");
            const img = await loadAndCustomiseSVG(item.asset_url, playerColors[Math.floor(Math.random() * playerColors.length)]);
            img.classList.add("image");
            templateImg.replaceWith(img);
            clone.querySelector(".name").textContent = item.name;
            return clone;
        }));
        this.container.replaceChildren(this.template, ...nodes);
    };

}
