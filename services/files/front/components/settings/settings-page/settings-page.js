import {HTMLComponent} from "/js/component.js";
import {fetchApi} from "/js/login-manager.js";

export class SettingsPage extends HTMLComponent {

    constructor() {
        super("settings-page", ["html", "css"], "settings");
    }

    onSetupCompleted = () => {
        this.avatarCarousel = this.shadowRoot.getElementById("avatar-carousel");
        this.spaceShipCarousel = this.shadowRoot.getElementById("spaceship-carousel");
        this.primaryColorCarousel = this.shadowRoot.getElementById("primary-color-carousel");
        this.secondaryColorCarousel = this.shadowRoot.getElementById("secondary-color-carousel");
    };

    onVisible = async () => {
        this.storeData = await fetchApi("/api/inventory").then(r => r.json());
        this.avatarCarousel.collection = this.storeData.avatars.map(item => ({...item, asset_url: `/assets/profile.svg`}));
        this.spaceShipCarousel.collection = this.storeData.spaceships.map(item => ({...item, asset_url: `/assets/spaceships/${item.id}.svg`}));
        this.primaryColorCarousel.collection = this.storeData.firstChoiceColors.map(item => ({...item, asset_url: this.#colorToSVG(item)}));
        this.secondaryColorCarousel.collection = this.storeData.secondChoiceColors.map(item => ({...item, asset_url: this.#colorToSVG(item)}));
    };

    #colorToSVG(colorData) {
        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 190 140" width="50" height="50">
            <circle cx="60" cy="60" r="60" fill="${colorData["cell-color"]}" />
            <circle cx="110" cy="80" r="50" fill="${colorData["primary-color"]}" />
            <circle cx="150" cy="100" r="40" fill="${colorData["secondary-color"]}" />
        </svg>`;
        return `data:image/svg+xml;base64,${btoa(svgString)}`;
    }
}
