import Particle from "./Particle";

export default class ShatterEffect {

    private canvasWidth: number
    private canvasHeight: number
    private ctx
    private particles: Array<Particle> = []


    constructor(canvasWidth: number, canvasHeight: number, particles: Array<Particle>, ctx: CanvasRenderingContext2D) {
        this.ctx = ctx
        this.canvasWidth = canvasWidth
        this.canvasHeight = canvasHeight
        this.particles = particles
    }


    private update() {

        this.particles.map(particle => {
            // const dx = this.collisionPoint.x - particle.x
            // const dy = this.collisionPoint.y - particle.y
            //
            // const distance = Math.sqrt(dx * dx + dy * dy)
            //
            // const force = (-this.collisionPoint.radius / distance ) * 10
            //
            // if(distance < this.collisionPoint.radius) {
            //     const angle = Math.atan2(dy, dx)
            //     const vx = Math.max(Math.min(force * Math.cos(angle), 400), -400)
            //     const vy = Math.max(Math.min(force * Math.sin(angle), 400), -400)
            //     particle.setVelocity(vx, vy)
            // }
            particle.update()
        })
    }

    public draw() {
        this.update()
        this.particles.map(particle => particle.draw())
    }
}