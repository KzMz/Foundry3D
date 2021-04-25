import { Foundry3D } from "./module/Foundry3D.js";

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

    game.foundry3d.startRendering();
    game.foundry3d.load3DTokens(game.actors.tokens);
});
