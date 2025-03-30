import {HTMLComponent} from "/js/component.js";
import {loadSpaceShip} from "/js/svg-utils.js";
import {playerColors} from "/js/player.js";

export class SettingsCarousel extends HTMLComponent {

    constructor() {
        super("settings-carousel", ["html", "css"], "settings");
    }

    onSetupCompleted = () => {

    };

    onVisible = async () => {
        const svgImgs = this.shadowRoot.querySelectorAll(".image");

        for (const svgImg of svgImgs) {
            const randomIndex = Math.floor(Math.random() * playerColors.length);
            const img = await loadSpaceShip(svgImg.id, playerColors[randomIndex]);
            img.className = svgImg.className;
            svgImg.replaceWith(img);
        }
    };

}
