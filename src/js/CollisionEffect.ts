import Particle from "./Particle";
type CollisionPoint = {
    x?: number,
    y?: number
    radius: number
}

export default class CollisionEffect {

    static use(particles: Array<Particle>, collisionPoint: CollisionPoint) {
        particles.map(particle => {
            const dx = collisionPoint.x - particle.x
            const dy = collisionPoint.y - particle.y

            const distance = Math.sqrt(dx * dx + dy * dy)

            const force = (-collisionPoint.radius / distance ) * 10

            if(distance < collisionPoint.radius) {
                const angle = Math.atan2(dy, dx)
                const vx = Math.max(Math.min(force * Math.cos(angle), 400), -400)
                const vy = Math.max(Math.min(force * Math.sin(angle), 400), -400)
                particle.setVelocity(vx, vy)
            }
        })
    }

}