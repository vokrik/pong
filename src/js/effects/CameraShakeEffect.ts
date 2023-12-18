import {CAMERA_SHAKE_FRAMES} from "../constants";

export default class CameraShakeEffect {

    private intensity= 0
    private remainingFrames = 0
    private ctx
    private width
    private height

    constructor(width: number, height: number, ctx: CanvasRenderingContext2D) {
        this.ctx = ctx
        this.width = width
        this.height = height
    }


    public startShake(intensity: number){
        this.remainingFrames = CAMERA_SHAKE_FRAMES
        this.intensity = intensity

    }
    public use() {
        if(this.remainingFrames <= 0) {
            return
        }
        const dx = Math.round( Math.cos((Math.PI / 6) * this.remainingFrames) * this.intensity)
        const originalCanvasData =  this.ctx.getImageData(0, 0, this.width, this.height )
        this.ctx.fillStyle = "black"
        this.ctx.fillRect(0, 0, this.width, this.height)
        this.ctx.putImageData(originalCanvasData, dx, 0)
        this.remainingFrames -= 1
    }

}