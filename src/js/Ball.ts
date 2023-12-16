import type {Point} from "./Point";
import {AbstractVector, Vector} from "vector2d";
import {BoundingBox} from "./BoundingBox";


const DEFAULT_SPEED_MULTIPLIER = 0.15

export default class Ball {
    private ctx: CanvasRenderingContext2D

    public position: Point
    private previousPosition: Point
    private direction: AbstractVector
    private speed: number
    public radius: number

    constructor(startingPosition: Point, direction: Vector, radius: number,  ctx: CanvasRenderingContext2D) {
        this.ctx = ctx
        this.position = startingPosition
        this.radius = radius
        this.direction = direction.clone().normalise()
        this.previousPosition = direction.clone().normalise()
        this.speed = DEFAULT_SPEED_MULTIPLIER * radius
    }

    public getBoundingBox(): BoundingBox {
        return {
            tl: {x: this.position.x - this.radius, y: this.position.y - this.radius},
            tr: {x: this.position.x + this.radius, y: this.position.y - this.radius},
            bl: {x: this.position.x - this.radius , y: this.position.y + this.radius},
            br: {x: this.position.x + this.radius , y: this.position.y + this.radius},
        }
    }

    public getTraveledCollisionLine() {
        return {
            pointA: this.getCollisionPoint(this.position),
            pointB: this.getCollisionPoint(this.previousPosition)
        }
    }
    private getCollisionPoint(position: Point): Point {

        return {
            x: position.x + this.direction.x * this.radius,
            y: position.y + this.direction.y * this.radius
        }
    }

    public move(elapsedTimeMs: number) {
        this.previousPosition = this.position
        this.position = {
            x: this.position.x + this.direction.x * elapsedTimeMs * this.speed,
            y: this.position.y + this.direction.y * elapsedTimeMs * this.speed
        }
    }

    public setPosition(position: Point){
        this.position = position
    }
    public setDirection(direction: Vector) {
        this.direction = direction
    }
    public bounce(collisionPoint: Point, surfaceNormal: Vector) {
        this.position = {
            x: collisionPoint.x - this.direction.x * this.radius,
            y: collisionPoint.y - this.direction.y* this.radius
        }
        const d = 2 * surfaceNormal.dot(this.direction);

       this.direction.x = this.direction.x - d * surfaceNormal.x;
       this.direction.y = this.direction.y - d * surfaceNormal.y

    }
    public render(): void {
        this.ctx.fillStyle = "white"
        this.ctx.beginPath()
        this.ctx.arc(this.position.x, this.position.y, this.radius, 0, 2* Math.PI)
        this.ctx.fill()

        this.ctx.fillStyle = "red"
        this.ctx.beginPath()
        const collisionPoint = this.getCollisionPoint(this.position)
        this.ctx.arc(collisionPoint.x, collisionPoint.y, this.radius/10, 0, 2* Math.PI)
        this.ctx.fill()

    }
}


