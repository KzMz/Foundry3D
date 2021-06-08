import { ECanvasPositions } from "./CanvasPositions.js";
import { UIPosition } from "./UIPosition.js";
import {FontInfo} from "./FontInfo.js";

export const BABYLON = window.BABYLON;

export class Foundry3D {
    static get DEFAULT_OPTIONS() {
        return {
            canvasPosition: ECanvasPositions.OVER_SCENE,
            receiveCanvasEvents: false,
            has2DUI: true
        }
    }

    static get CONFIG() {
         return mergeObject(Foundry3D.DEFAULT_OPTIONS, game.settings.get("foundry3d", "settings"));
    }

    createUIPosition() {
        return new UIPosition();
    }

    createFontInfo() {
        return new FontInfo();
    }

    constructor() {
        Hooks.call("foundry3dInit", this);

        this._setupCanvas();
        this._initListeners();

        this._setupEngineAndScene();

        const $self = this;
        BABYLON.GUI.Control.prototype.getScene = function () { return $self._scene; };
        if (Foundry3D.CONFIG.has2DUI) {
            this._setup2DGui();
        }

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

        if (!Foundry3D.CONFIG.receiveCanvasEvents) {
            this.canvas.css('pointer-events', 'none');
        }

        this._engine.resize();
    }

    _setupEngineAndScene() {
        this._engine = new BABYLON.Engine(this.canvas[0], true);
        this._scene = new BABYLON.Scene(this._engine);
    }

    _setup2DGui() {
        this._uiTexture = null;
        if (!BABYLON.GUI) return;

        this._uiTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("FoundryUI");
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

    _applyPositionToUIElement(element, uiPosition) {
        if (!element || !uiPosition) return;

        element.top = uiPosition.top;
        element.bottom = uiPosition.bottom;
        element.left = uiPosition.left;
        element.right = uiPosition.right;
        element.horizontalAlignment = uiPosition.horizontalAlignment;
        element.verticalAlignment = uiPosition.verticalAlignment;

        if (uiPosition.width) element.width = uiPosition.width;
        if (uiPosition.height) element.height = uiPosition.height;

        element.scaleX = uiPosition.scaleX;
        element.scaleY = uiPosition.scaleY;
    }

    fadeIn2DElement(element, speed) {
        this.animate2DElement(element, speed, "alpha", 0, 1);
    }

    fadeOut2DElement(element, speed) {
        this.animate2DElement(element, speed, "alpha", 1, 0);
    }

    animate2DElement(element, speed, property, from, to, ease) {
        if (!ease) {
            ease = new BABYLON.CubicEase();
            ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
        }

        BABYLON.Animation.CreateAndStartAnimation("Foundry2DAnim", element, property, speed, 10, from, to, 0, ease);
    }

    addPlane2D(background, color, uiPosition, parent) {
        const plane2d = new BABYLON.GUI.Rectangle("FoundryRectangle");
        plane2d.gui = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(plane2d, 1024, 1024);

        plane2d.background = background;
        plane2d.color = color;

        this._applyPositionToUIElement(plane2d, uiPosition);

        plane2d.alpha = 1;
        plane2d.cornerRadius = 0;
        plane2d.thickness = 0;
        plane2d.zIndex = 5;

        if (parent) {
            parent.addControl(plane2d);
        } else {
            this._uiTexture.addControl(plane2d);
        }

        return plane2d;
    }

    addText2D(text, fontInfo, uiPosition, parent) {
        const text2d = new BABYLON.GUI.TextBlock();
        text2d.text = text;

        if (fontInfo) {
            text2d.color = fontInfo.color;
            text2d.fontSize = fontInfo.fontSize;
            text2d.fontFamily = fontInfo.fontFamily;
        }

        this._applyPositionToUIElement(text2d, uiPosition);

        if (parent) {
            parent.addControl(text2d);
        } else {
            this._uiTexture.addControl(text2d);
        }

        return text2d;
    }

    addImage2D(imagePath, stretchType, uiPosition, parent) {
        const image2d = new BABYLON.GUI.Image("FoundryImage", imagePath);
        if (stretchType) {
            image2d.stretch = stretchType;
        } else {
            image2d.stretch = BABYLON.GUI.Image.STRETCH_NONE;
        }

        this._applyPositionToUIElement(image2d, uiPosition);

        if (parent) {
            parent.addControl(image2d);
        } else {
            this._uiTexture.addControl(image2d);
        }

        return image2d;
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