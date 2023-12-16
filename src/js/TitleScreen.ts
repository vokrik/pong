import CollisionEffect from "./CollisionEffect";
import CanvasAnalyzer from "./CanvasAnalyzer";
import Particle from "./Particle";

type Mouse = {
    x?: number,
    y?: number
}
export default class TitleScreen {

    private ctx: CanvasRenderingContext2D
    private width: number
    private height: number
    private particles: Array<Particle>
    private mouse: Mouse = {
        x: undefined,
        y: undefined
    }

    constructor(width: number, height: number, ctx: CanvasRenderingContext2D) {
        this.width = width
        this.height = height
        this.ctx = ctx
        this.particles = CanvasAnalyzer.convertCanvasToParticles(this.width, this.height, 2, () => {
            this.ctx.fillStyle = "white"
            this.ctx.font = `140px VT323`
            this.ctx.textAlign = "center"
            this.ctx.textBaseline = "middle"
            this.ctx.clearRect(0, 0, width, height)
            this.ctx.fillText("Particle Pong", this.width / 2, this.height / 2)

            this.ctx.font = `50px VT323`
            this.ctx.fillText("*Press Enter to start*", this.width / 2, this.height / 2 + 150)
        }, this.ctx)


        document.addEventListener('mousemove', (e) => {
            this.mouse = {
                x: e.x,
                y: e.y
            }
        })
    }

    private update() {
        CollisionEffect.use(this.particles, {
            x: this.mouse.x,
            y: this.mouse.y,
            radius: 40
        })
        this.particles.forEach(particle => particle.update())
    }

    render() {
        this.update()
        this.ctx.strokeStyle = "red"
        this.ctx.beginPath()
        this.ctx.moveTo(this.width / 2, 0)
        this.ctx.lineTo(this.width / 2, this.height)
        this.ctx.stroke()
        this.ctx.beginPath()
        this.ctx.moveTo(0, this.height / 2)
        this.ctx.lineTo(this.width, this.height / 2)
        this.ctx.stroke()
        this.particles.map(particle => particle.draw())
    }
}



