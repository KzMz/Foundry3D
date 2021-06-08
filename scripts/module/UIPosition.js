const BABYLON = window.BABYLON;

export class UIPosition {
    constructor() {
        this.width = undefined;
        this.height = undefined;
        this.left = "0px";
        this.right = "0px";
        this.top = "0px";
        this.bottom = "0px";
        this.scaleX = 1;
        this.scaleY = 1;
        this.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    }
}