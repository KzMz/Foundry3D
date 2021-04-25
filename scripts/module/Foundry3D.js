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
        this._setupEngineAndScene();
        this._resizeCanvas();

        this._welcomeMessage();
    }

    _setupCanvas() {
        this.canvas = $('<canvas id="foundry3d-canvas"></canvas>');
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

    _setupEngineAndScene() {
        this._engine = new BABYLON.Engine(this.canvas[0], true);
        this._scene = new BABYLON.Scene(this._engine);
    }

    _prepareSceneItems() {
        const camera = new BABYLON.UniversalCamera("Camera", new BABYLON.Vector3(0, 0, -10), this._scene);
        camera.attachControl(this.canvas, true);
        const light = new BABYLON.HemisphericLight("Light", new BABYLON.Vector3(1, 1, 0), this._scene);
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

    startRendering() {
        this._prepareSceneItems();

        this._scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
        this._engine.runRenderLoop(() => {
            this._scene.render();
        });

        Hooks.call("foundry3dReady", this);
    }

    load3DTokens(tokens) {
        Object.keys(tokens).forEach(key => {
            const token = tokens[key].token;
            const foundryScene = token.scene;
            const h = token.scene.height;
            const w = token.scene.width;
            const x = token.x;
            const y = token.y;
            const gridSize = foundryScene.data.grid;

            const sphere = BABYLON.MeshBuilder.CreateSphere("Sphere", { diameter: 1 }, this._scene);
            sphere.position = new BABYLON.Vector3(x / w, y / h, 0);
        });
    }

    updateSoftSettings(settings) {

    }
}