import Effect from "./Effect";
import Pong from "./Pong";
import * as worker_threads from "worker_threads";

export default class TitleScreen {

    // private title: ParticleTextEffect
    private title
    private ctx: CanvasRenderingContext2D
    private width: number
    private height: number


    constructor(width: number, height: number, ctx: CanvasRenderingContext2D) {
        this.width = width
        this.height = height
        this.ctx = ctx
        const text = "Particle PONG"
        const textX = this.width / 2
        const textY = this.height / 2
        this.title = new ParticleTextEffect(text, 80, this.width, this.height, this.ctx)
        document.addEventListener('mousemove', (e) => {
            this.title.setCollisionPointPosition(e.x, e.y)
        })
    }

    render() {
        this.ctx.strokeStyle = "red"
        this.ctx.beginPath()
        this.ctx.moveTo(this.width / 2, 0)
        this.ctx.lineTo(this.width / 2, this.height)
        this.ctx.stroke()
        this.ctx.beginPath()
        this.ctx.moveTo(0, this.height / 2)
        this.ctx.lineTo(this.width, this.height / 2)
        this.ctx.stroke()
        this.title.draw()

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
        this.ease = 0.06
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