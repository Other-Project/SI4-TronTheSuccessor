import {HTMLComponent} from "/js/component.js";
import nipplejs from "https://cdn.jsdelivr.net/npm/nipplejs@0.10.2/+esm";
import {directionToAngle} from "/js/player.js";

export class GameJoystick extends HTMLComponent {
    direction = "right";
    directionToAngleEntries = Object.entries(directionToAngle);

    constructor() {
        super("game-joystick", ["css"]);
    }

    onSetupCompleted = () => {
        const joystickContainer = document.createElement("div");
        const joystickZone = document.createElement("div");
        joystickContainer.id = "joystick-zone";
        joystickContainer.appendChild(joystickZone);
        this.shadowRoot.appendChild(joystickContainer);

        const size = 120;
        const joystick = nipplejs.create({
            zone: joystickZone,
            mode: "static",
            position: {left: "50%", top: "50%"},
            color: "#000000",
            size: size
        });

        joystick.on("move", (evt, data) => {
            if (data.force < 0.2) return;

            let adjustedAngle = (450 - data.angle.degree) % 360;
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
                    detail: this.direction,
                    bubbles: true,
                    composed: true
                }));
            }
        });
    };
}
