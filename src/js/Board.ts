import Paddle from "./Paddle";
import {Actor, SnapshotFrom} from "xstate";
import {gamesState} from "./state";
import Ball from "./Ball";
import {Vector} from "vector2d";
import {BoundingBox} from "./BoundingBox";
import {Point} from "./Point";

const PADDLE_WIDTH_PERCENT = 0.01
const PADDLE_HEIGHT_PERCENT = 0.3
const PADDLE_DISTANCE_FROM_SIDE_PERCENT = 0.1
const BALL_RADIUS_PERCENT = 0.015

type LineBy2Points = {
    pointA: Point
    pointB: Point
}
export default class Board {

    private ctx: CanvasRenderingContext2D
    private score
    private player: Paddle
    private opponent: Paddle
    private ball: Ball
    private width: number
    private height: number
    private actor: Actor<typeof gamesState>


    constructor(width: number, height: number, actor: Actor<typeof gamesState>, ctx: CanvasRenderingContext2D) {
        this.ctx = ctx
        this.width = width
        this.height = height
        this.actor = actor

        const paddleWidth = this.width * PADDLE_WIDTH_PERCENT
        const paddleHeight = this.height * PADDLE_HEIGHT_PERCENT
        const xPadding = this.width * PADDLE_DISTANCE_FROM_SIDE_PERCENT
        const yPosition = height / 2 - paddleHeight / 2

        this.player = new Paddle({
            x: xPadding,
            y: yPosition
        }, new Vector(1, 0), paddleWidth, paddleHeight, this.ctx)

        this.opponent = new Paddle({
                x: width - xPadding - paddleWidth,
                y: yPosition
            },
            new Vector(-1, 0), paddleWidth, paddleHeight,
            this.ctx
        )

        this.ball = new Ball({
            x: width / 2,
            y: height / 2
        }, new Vector(-10, 0), Math.min(height * BALL_RADIUS_PERCENT, width * BALL_RADIUS_PERCENT), this.ctx)

        this.score = new ParticleTextEffect("9 : 1", 90, this.width, this.height, this.ctx)

    }

    private movePlayer(state: SnapshotFrom<typeof gamesState>) {
        if (state.matches({"Play game": {Player: "Moving up"}})) {
            this.player.moveUp(state.context.elapsedTimeMs)
        }

        if (state.matches({"Play game": {Player: "Moving down"}})) {
            this.player.moveDown(state.context.elapsedTimeMs)
        }
    }


    protected resolveCollisions() {
        const playerBounds = this.player.getBoundingBox()
        const opponentBounds = this.opponent.getBoundingBox()
        const ballBounds = this.ball.getBoundingBox()

        if (playerBounds.tl.y <= 0) {
            this.player.moveToVerticalPosition(0)
        }
        if (playerBounds.bl.y >= this.height) {
            this.player.moveToVerticalPosition(this.height, false)
        }

        const collisionPointWithPlayer = this.intersectionOf2Lines({pointA: playerBounds.tr, pointB: playerBounds.br}, this.ball.getTraveledCollisionLine() )
        if(collisionPointWithPlayer){
            this.ball.setPosition(collisionPointWithPlayer)
            this.ball.setDirection(this.player.getNormalAtPoint(collisionPointWithPlayer))
        }
        const collisionPointWithOpponent = this.intersectionOf2Lines({pointA: opponentBounds.tl, pointB: opponentBounds.bl}, this.ball.getTraveledCollisionLine() )
        if(collisionPointWithOpponent){
            this.ball.setPosition(collisionPointWithOpponent)
            this.ball.setDirection(this.opponent.getNormalAtPoint(collisionPointWithOpponent))        }

        const collisionPointWithTopWall = this.intersectionOf2Lines({pointA: {x: 0, y: 0}, pointB: {x: this.width, y:0}}, this.ball.getTraveledCollisionLine() )
        if(collisionPointWithTopWall){
            this.ball.bounce(collisionPointWithTopWall, new Vector(0, 1))
        }

        const collisionPointWithBottomWall = this.intersectionOf2Lines({pointA: {x: 0, y: this.height}, pointB: {x: this.width, y:this.height}}, this.ball.getTraveledCollisionLine() )
        if(collisionPointWithBottomWall){
            this.ball.bounce(collisionPointWithBottomWall, new Vector(0, -1) )
        }

        const collisionPointLeftWall = this.intersectionOf2Lines({pointA: {x: 0, y: 0}, pointB: {x: 0, y:this.height}}, this.ball.getTraveledCollisionLine() )
        if(collisionPointLeftWall){
            this.ball.bounce(collisionPointLeftWall, new Vector(1, 0) )
        }
        const collisionPointRightWall = this.intersectionOf2Lines({pointA: {x: this.width, y: 0}, pointB: {x: this.width, y:this.height}}, this.ball.getTraveledCollisionLine() )
        if(collisionPointRightWall){
            this.ball.bounce(collisionPointRightWall, new Vector(-1, 0) )
        }
    }

    protected intersectionOf2Lines(lineA: LineBy2Points, lineB: LineBy2Points) {
        
        if ((lineA.pointA.x === lineA.pointB.x && lineA.pointA.y === lineA.pointB.y) || (lineB.pointA.x === lineB.pointB.x && lineB.pointA.y === lineB.pointB.y)) {
            return null
        }

        const denominator = ((lineB.pointB.y - lineB.pointA.y) * (lineA.pointB.x - lineA.pointA.x) - (lineB.pointB.x - lineB.pointA.x) * (lineA.pointB.y - lineA.pointA.y))

        // Lines are parallel
        if (denominator === 0) {
            return null
        }

        let ua = ((lineB.pointB.x - lineB.pointA.x) * (lineA.pointA.y - lineB.pointA.y) - (lineB.pointB.y - lineB.pointA.y) * (lineA.pointA.x - lineB.pointA.x)) / denominator
        let ub = ((lineA.pointB.x - lineA.pointA.x) * (lineA.pointA.y - lineB.pointA.y) - (lineA.pointB.y - lineA.pointA.y) * (lineA.pointA.x - lineB.pointA.x)) / denominator

        // is the intersection along the segments
        if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
            return null
        }

        let x = lineA.pointA.x + ua * (lineA.pointB.x - lineA.pointA.x)
        let y = lineA.pointA.y + ua * (lineA.pointB.y - lineA.pointA.y)

        return {x, y}
    }

    protected areBondingBoxesIntersecting(first: BoundingBox, second: BoundingBox ) {
        const firstMinX = Math.min(first.tl.x, first.bl.x)
        const firstMinY = Math.min(first.tl.y, first.bl.y)
        const firstMaxX = Math.max(first.tr.x, first.br.x)
        const firstMaxY = Math.max(first.tr.y, first.br.y)

        const secondMinX = Math.min(second.tl.x, second.bl.x)
        const secondMinY = Math.min(second.tl.y, second.bl.y)
        const secondMaxX = Math.max(second.tr.x, second.br.x)
        const secondMaxY = Math.max(second.tr.y, second.br.y)

        const firstLeftOfSecond = firstMaxX < secondMinX
        const firstRightOfSecond = firstMinX > secondMaxX
        const firstAboveSecond = firstMinY > secondMaxY
        const firstBelowSecond = firstMaxY < secondMinY

        return !(firstLeftOfSecond || firstRightOfSecond || firstAboveSecond || firstBelowSecond)

    }




    protected update() {
        const state = this.actor.getSnapshot()
        this.movePlayer(state)
        this.ball.move(state.context.elapsedTimeMs)
        this.resolveCollisions()
        this.score.setCollisionPointPosition(this.ball.position.x, this.ball.position.y)
    }


    public render() {
        this.update()
        this.ctx.beginPath();
        this.ctx.strokeStyle = "white"
        this.ctx.setLineDash([5, 15]);
        this.ctx.moveTo((this.width / 2) - 1, 0);
        this.ctx.lineWidth = 3;

        this.ctx.lineTo(this.width / 2 , this.height);
        this.ctx.stroke();

        this.player.render()
        this.opponent.render()
        this.score.draw()
        this.ball.render()

    }
}



class Particle {
    private ctx: CanvasRenderingContext2D
    private x: number
    private y: number
    private originX: number
    private originY: number
    private dx: number
    private dy: number
    private force: number
    private angle: number
    private distance: number
    private vx: number
    private vy: number

    private ease: number
    private friction: number
    private color
    private size: number

    constructor(x: number, y: number, originX: number, originY: number, size: number, color: string, ctx: CanvasRenderingContext2D) {
        this.ctx = ctx
        this.color = color
        this.x = x
        this.y = y
        this.vx = 0
        this.vy = 0
        this.ease = 0.07
        this.friction = 0.4
        this.originX = originX
        this.originY = originY
        this.friction = Math.random() * 0.1 + 0.15
        this.size = size
    }

    public update(collisionPoint: CollisionPoint) {
        this.dx = collisionPoint.x - this.x
        this.dy = collisionPoint.y - this.y

        this.distance = Math.sqrt(this.dx * this.dx + this.dy * this.dy)

        this.force = (-collisionPoint.radius / this.distance ) * 10

        if(this.distance < collisionPoint.radius) {
            this.angle = Math.atan2(this.dy, this.dx)
            this.vx = Math.max(Math.min(this.force * Math.cos(this.angle), 400), -400)
            this.vy = Math.max(Math.min(this.force * Math.sin(this.angle), 400), -400)
        }

        this.x += (this.vx *= this.friction) + (this.originX - this.x) * this.ease
        this.y += (this.vy *= this.friction) + (this.originY - this.y) * this.ease
    }
    public draw() {
        this.ctx.fillStyle = this.color
        this.ctx.fillRect(this.x, this.y, this.size, this.size)
    }
}

type CollisionPoint = {
    x?: number,
    y?: number
    radius: number
}
class ParticleTextEffect {
    private textHeight
    private canvasWidth: number
    private canvasHeight: number
    private ctx
    private text
    private x
    private y
    private particles: Array<Particle> = []
    private gap = 4
    private collisionPoint: CollisionPoint

    constructor(text: string, textHeight: number, canvasWidth: number, canvasHeight: number, ctx: CanvasRenderingContext2D) {
        this.textHeight = textHeight
        this.ctx = ctx
        this.canvasWidth = canvasWidth
        this.canvasHeight = canvasHeight
        this.text = text
        this.x = this.canvasWidth / 2
        this.y = this.canvasHeight / 2
        this.collisionPoint = {
            radius: 50
        }
        this.convertToParticles()
    }

    setCollisionPointPosition(x: number, y: number) {
        this.collisionPoint.x = x
        this.collisionPoint.y = y
    }

    private convertToParticles() {

        this.ctx.fillStyle = "white"
        this.ctx.font = `${this.textHeight}px Helvetica`
        this.ctx.textAlign = "center"
        this.ctx.textBaseline = "middle"
        this.ctx.clearRect(0,0, this.canvasWidth, this.canvasHeight)

        this.ctx.fillText(this.text, this.x, this.y)

        const pixels = this.ctx.getImageData(0, 0, this.canvasWidth, this.canvasHeight ).data
        for (let y = 0; y < this.canvasHeight; y += this.gap) {
            for (let x = 0; x < this.canvasWidth; x += this.gap) {
                const index = (y * this.canvasWidth + x) * 4
                const r = pixels[index]
                const g = pixels[index + 1]
                const b = pixels[index + 2]
                const alpha = pixels[index + 3]
                if (alpha > 0) {
                    this.particles.push(new Particle( Math.random() * this.canvasWidth, Math.random() * this.canvasHeight, x, y, this.gap, `rgb(${r},${g},${b})`, this.ctx))
                }
            }
        }



    }

    private update() {
        this.particles.map(particle => particle.update(this.collisionPoint))
    }

    public draw() {
        this.update()
        this.particles.map(particle => particle.draw())
    }
}