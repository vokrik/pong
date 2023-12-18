import type {Point} from "./Point";
import {AbstractVector, Vector} from "vector2d";
import {BALL_RADIUS_PERCENT} from "../constants";



export default class Ball {
    private ctx: CanvasRenderingContext2D
    public position?: Point
    private previousPosition?: Point
    public direction?: AbstractVector
    public speed: number
    public radius: number
    public isActive: boolean
    constructor(canvasWidth: number, canvasHeight: number, speed: number,  ctx: CanvasRenderingContext2D) {
        this.ctx = ctx
        this.radius = Math.min(canvasWidth * BALL_RADIUS_PERCENT, canvasHeight * BALL_RADIUS_PERCENT)
        this.speed = speed * this.radius
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


