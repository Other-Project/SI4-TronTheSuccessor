import {HTMLComponent} from "/js/component.js";
import nipplejs from "https://cdn.jsdelivr.net/npm/nipplejs@0.10.2/+esm";
import {directionToAngle} from "/js/player.js";

export class GameJoystick extends HTMLComponent {
    direction = "right";
    directionToAngleEntries = Object.entries(directionToAngle);
    size = 120;
    color = "#75208f";

    static get observedAttributes() {
        return ["color", "size"];
    }

    constructor() {
        super("game-joystick", ["css"]);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        this.#refresh();
    }

    onSetupCompleted = () => {
        const joystickContainer = document.createElement("div");
        joystickContainer.id = "joystick-zone";
        this.joystickZone = document.createElement("div");
        joystickContainer.appendChild(this.joystickZone);
        this.shadowRoot.appendChild(joystickContainer);
        this.#refresh();
    };

    #refresh() {
        if (this.joystick) this.joystick.destroy();
        this.joystickZone.innerHTML = "";
        this.joystickZone.style.width = this.joystickZone.style.height = `${this.size}px`;

        this.joystick = nipplejs.create({
            zone: this.joystickZone,
            mode: "static",
            position: {left: "50%", top: "50%"},
            color: this.color,
            size: this.size
        });

        this.joystick.on("move", (evt, data) => {
            if (data.force < 0.2) return;

            let adjustedAngle = (450 - data.angle.degree) % 360;
            if (window.innerWidth < window.innerHeight) adjustedAngle = (adjustedAngle + 90) % 360;
            let closestDirection = null;
            let smallestDiff = 360;

            for (const [dir, angle] of this.directionToAngleEntries) {
                let diff = Math.abs(adjustedAngle - angle);
                diff = Math.min(diff, 360 - diff);
                if (diff < smallestDiff) {
                    smallestDiff = diff;
                    closestDirection = dir;
                }
            }

            if (closestDirection && closestDirection !== this.direction) {
                this.direction = closestDirection;
                this.dispatchEvent(new CustomEvent("joystick-direction", {
                    detail: this.direction
                }));
            }
        });
    }
}
