import type {Point} from "./Point";
import {AbstractVector, Vector} from "vector2d";
import {BoundingBox} from "./BoundingBox";


const DEFAULT_SPEED_MULTIPLIER = 0.08
export const BALL_RADIUS_PERCENT = 0.015

export default class Ball {
    private ctx: CanvasRenderingContext2D
    public position?: Point
    private previousPosition?: Point
    private direction?: AbstractVector
    private speed: number
    public radius: number
    public isActive: boolean
    constructor(radius: number,  ctx: CanvasRenderingContext2D) {
        this.ctx = ctx
        this.radius = radius
        this.speed = DEFAULT_SPEED_MULTIPLIER * radius
        this.isActive = false
    }

    public stopAndHide() {
        this.isActive = false
    }

    public start(position: Point, direction: Vector) {
        this.direction = direction.clone().normalise()
        this.position = position
        this.previousPosition = position
        this.isActive = true
    }


    public getTraveledCollisionLine() {
        if(!this.isActive) {
            return null
        }

        return {
            pointA: this.getDirectionalOuterPoint(this.position),
            pointB: this.getDirectionalOuterPoint(this.previousPosition)
        }
    }
    private getDirectionalOuterPoint(position: Point): Point {

        return {
            x: position.x + this.direction.x * this.radius,
            y: position.y + this.direction.y * this.radius
        }
    }

    public update(elapsedTimeMs: number) {
        if(!this.isActive) {
            return
        }
        this.previousPosition = this.position
        this.position = {
            x: this.position.x + this.direction.x  * this.speed * elapsedTimeMs,
            y: this.position.y + this.direction.y  * this.speed * elapsedTimeMs
        }
    }

    public setPosition(position: Point){
        this.position = position
    }
    public setDirection(direction: Vector) {
        this.direction = direction
    }
    public bounce(collisionPoint: Point, surfaceNormal: Vector) {
        if(!this.isActive) {
            return
        }
        this.position = {
            x: collisionPoint.x - this.direction.x * this.radius,
            y: collisionPoint.y - this.direction.y * this.radius
        }
        const d = 2 * surfaceNormal.dot(this.direction);

       this.direction.x = this.direction.x - d * surfaceNormal.x;
       this.direction.y = this.direction.y - d * surfaceNormal.y

    }
    public render(): void {
        if(!this.isActive) {
            return
        }
        this.ctx.fillStyle = "white"
        this.ctx.beginPath()
        this.ctx.arc(this.position.x, this.position.y, this.radius, 0, 2* Math.PI)
        this.ctx.fill()

    }
}


