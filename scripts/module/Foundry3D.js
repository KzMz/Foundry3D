import { ECanvasPositions } from "./CanvasPositions.js";
export const BABYLON = window.BABYLON;

export class Foundry3D {
    static get DEFAULT_OPTIONS() {
        return {
            canvasPosition: ECanvasPositions.OVER_SCENE
        }
    }

    static get CONFIG() {
         return mergeObject(Foundry3D.DEFAULT_OPTIONS, game.settings.get("foundry3d", "settings"));
    }

    constructor() {
        Hooks.call("foundry3dInit", this);

        this._setupCanvas();
        this._initListeners();
        this._setupEngine();
        this._resizeCanvas();

        this._welcomeMessage();

        Hooks.call("foundry3dReady", this);
    }

    _setupCanvas() {
        this.canvas = $('<canvas id="foundry3d-canvas" style="position: absolute; left: 0; top: 0;pointer-events: none;"></canvas>');
        switch (Foundry3D.CONFIG.canvasPosition) {
            case ECanvasPositions.OVER_SCENE:
                this.canvas.css('z-index', 1000);
                this.canvas.appendTo($('body'));
                break;
            case ECanvasPositions.AFTER_SCENE:
                $('#board').after(this.canvas);
                break;
        }

        this.canvasPosition = Foundry3D.CONFIG.canvasPosition;
    }

    _resizeCanvas() {
        const sidebarWidth = $('#sidebar').width() + 10;
        this.canvas.width(window.innerWidth - sidebarWidth + 'px');
        this.canvas.height(window.innerHeight - 1 + 'px');

        this._engine.resize();
    }

    _setupEngine() {
        this._engine = new BABYLON.Engine(this.canvas[0], true);
        this._scene = new BABYLON.Scene(this._engine);

        const camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, BABYLON.Vector3.Zero(), this._scene);
        camera.attachControl(this.canvas[0], true);

        const light = new BABYLON.HemisphericLight("Light", new BABYLON.Vector3(1, 1, 0), this._scene);
        const sphere = BABYLON.MeshBuilder.CreateSphere("Sphere", { diameter: 1 }, this._scene);

        this._engine.runRenderLoop(() => {
            this._scene.render();
        });
    }

    _initListeners() {
        $(window).on("resize",() => {
            this._resizeCanvas();
        });
    }

    _welcomeMessage() {

    }

    needsReload(settings) {
        return settings.canvasPosition !== this.canvasPosition;
    }

    updateSoftSettings(settings) {

    }
}