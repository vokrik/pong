import type {Point} from "./Point";
import {Vector} from "vector2d";
import {BoundingBox} from "./BoundingBox";
import {nodeModules} from "ts-loader/dist/constants";

const MOVEMENT_SPEED = 0.008
const MAX_PADDLE_ANGLE = 0.9
export default class Paddle {
    private ctx: CanvasRenderingContext2D

    private position: Point
    private facingDirection: Vector
    private width: number
    private height: number
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

    public getBoundingBox(): BoundingBox {
        return {
            tl: {x: this.position.x, y: this.position.y},
            tr: {x: this.position.x + this.width, y: this.position.y},
            bl: {x: this.position.x , y: this.position.y + this.height},
            br: {x: this.position.x + this.width , y: this.position.y + this.height},
        }
    }

    public getNormalAtPoint(point: Point) {
        const halfPaddleHeight = this.height / 2
        const paddleCenterY = this.position.y +  halfPaddleHeight
        const distanceFromCenter = point.y - paddleCenterY

        return this.facingDirection.clone().rotate(  MAX_PADDLE_ANGLE * (distanceFromCenter / halfPaddleHeight) * Math.sign(this.facingDirection.x) ) as Vector
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
        const boundingBox = this. getBoundingBox()
        for(let i = boundingBox.tr.y; i <= boundingBox.br.y; i = i + 5) {
            const normal = this.getNormalAtPoint({x: boundingBox.tr.x, y: i})
            normal.multiplyByScalar(130)
            drawLine({x: boundingBox.tr.x, y: i}, {x: boundingBox.tr.x + normal.x , y: i + normal.y})
        }

    }
}


