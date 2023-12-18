import {Bounds, BOUNDS_TYPE, SIDE} from "./Bounds";
import {Point} from "../sharedTypes";
import {MAX_PADDLE_ANGLE, MOVEMENT_SPEED} from "../constants";


export default class Paddle {
    private ctx: CanvasRenderingContext2D

    private position: Point
    public width: number
    public height: number
    private speed: number
    public readonly  activeSide: SIDE.LEFT | SIDE.RIGHT

    constructor(startingPosition: Point, activeSide: SIDE.LEFT | SIDE.RIGHT, width: number, height: number, ctx: CanvasRenderingContext2D) {
        this.ctx = ctx
        this.position = startingPosition
        this.position = startingPosition
        this.activeSide = activeSide
        this.width = width
        this.height = height
        this.speed = MOVEMENT_SPEED * height
    }

    public moveUp(elapsedTimeMs: number) {
        this.position.y -= this.speed * elapsedTimeMs
    }

    public moveDown(elapsedTimeMs: number) {
        this.position.y += this.speed * elapsedTimeMs

    }

    public getBounds(): Bounds {
        return new Bounds( {
            tl: {x: this.position.x, y: this.position.y},
            tr: {x: this.position.x + this.width, y: this.position.y},
            bl: {x: this.position.x , y: this.position.y + this.height},
            br: {x: this.position.x + this.width , y: this.position.y + this.height},
        }, BOUNDS_TYPE.OUTER)
    }

    public getCenter(): Point {
        return {
            x: this.position.x + this.width / 2,
            y: this.position.y + this.height / 2
        }
    }
    public getNormalRotationAtPoint(point: Point) {
        const halfPaddleHeight = this.height / 2
        const paddleCenterY = this.position.y +  halfPaddleHeight
        const distanceFromCenter = point.y - paddleCenterY
        const direction = this.activeSide === SIDE.LEFT ? -1 : 1

        return  MAX_PADDLE_ANGLE * (distanceFromCenter / halfPaddleHeight) * direction
    }
    public moveToVerticalPosition(y: number, byTop: boolean = true) {
        this.position.y = byTop ? y : y - this.height
    }


    public render(): void {
        this.ctx.fillStyle = "white"
        this.ctx.fillRect(this.position.x, this.position.y, this.width, this.height)

    }
}


