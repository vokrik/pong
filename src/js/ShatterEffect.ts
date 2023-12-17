import Particle from "./Particle";
import {SIDE} from "./Bounds";

const GRAVITY = 1
export default class ShatterEffect {


    static use(width: number, height: number, particles: Array<Particle>) {
        particles.map(particle => {
            const vx = particle.vx
            const vy = particle.vy + GRAVITY

            particle.setVelocity(vx, vy)
        })
    }
}