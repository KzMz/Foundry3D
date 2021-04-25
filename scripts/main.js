import { BABYLON, Foundry3D } from "./module/Foundry3D.js";
import { UIPosition } from "./module/UIPosition.js";

Hooks.once('init', async function() {
    game.settings.register("foundry3d", "settings", {
        name: "Foundry3D Settings",
        scope: "client",
        default: Foundry3D.DEFAULT_OPTIONS,
        type: Object,
        config: false,
        onChange: settings => {
            if (!game.foundry3d) return;

            if (game.foundry3d.needsReload(settings)) {
                location.reload();
            } else {
                game.foundry3d.updateSoftSettings(settings);
            }
        }
    });
});

Hooks.once('ready', async function() {
    game.foundry3d = new Foundry3D();

    /*const pos = new UIPosition();
    pos.horizontalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_LEFT;
    pos.verticalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_TOP;

    let p = game.foundry3d.addPlane2D("transparent", "white", pos);
    game.foundry3d.addImage2D("../assets/meruk.png", undefined, pos, p);
    game.foundry3d.fadeIn2DElement(p, 10);*/

    game.foundry3d.startRendering();
});
