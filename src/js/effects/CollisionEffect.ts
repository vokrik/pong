import Particle from "../gameObjects/Particle";

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

            if (distance < collisionPoint.radius * 3) {
                const computedForce = (-collisionPoint.radius / distance) * 10
                const force = Math.sign(computedForce)* Math.min(Math.abs(computedForce), 50)

                const angle = Math.atan2(dy, dx)
                const vx = force * Math.cos(angle)
                const vy = force * Math.sin(angle)

                particle.setVelocity(vx, vy)
            }

            particle.vx = particle.vx * particle.friction + (particle.targetPositionX - particle.x) * particle.ease
            particle.vy = particle.vy * particle.friction + (particle.targetPositionY - particle.y) * particle.ease
        })
    }
}