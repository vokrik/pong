import type {Point} from "./Point";
import {Vector} from "vector2d";
import {Bounds, BOUNDS_TYPE} from "./Bounds";

const MOVEMENT_SPEED = 0.008
const MAX_PADDLE_ANGLE = 0.9
export default class Paddle {
    private ctx: CanvasRenderingContext2D

    private position: Point
    private facingDirection: Vector
    public width: number
    public height: number
    private speed: number

    constructor(startingPosition: Point, facingDirection: Vector, width: number, height: number, ctx: CanvasRenderingContext2D) {
        this.ctx = ctx
        this.position = startingPosition
        this.facingDirection = facingDirection
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

        return  MAX_PADDLE_ANGLE * (distanceFromCenter / halfPaddleHeight) * Math.sign(this.facingDirection.x)
    }
    public moveToVerticalPosition(y: number, byTop: boolean = true) {
        this.position.y = byTop ? y : y - this.height
    }


    public render(): void {
        this.ctx.fillStyle = "white"
        this.ctx.fillRect(this.position.x, this.position.y, this.width, this.height)

         const drawLine = (pointA: Point, pointB: Point) => {
             this.ctx.beginPath();
             this.ctx.strokeStyle = "white"
             this.ctx.setLineDash([])
             this.ctx.moveTo(pointA.x, pointA.y);
             this.ctx.lineWidth = 1;

             this.ctx.lineTo(pointB.x, pointB.y);
             this.ctx.stroke();
        }

    }
}


