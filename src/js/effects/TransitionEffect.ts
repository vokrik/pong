import Particle from "../gameObjects/Particle";
import {Actor} from "xstate";
import {gamesState} from "../state";


export enum TransitionType {
    IN,
    OUT
}
export default class TransitionEffect {

    private ctx: CanvasRenderingContext2D
    private width: number
    private height: number
    private particles: Array<Particle>
    private actor

    constructor( width: number, height: number, actor: Actor<typeof gamesState>, ctx: CanvasRenderingContext2D) {
        this.width = width
        this.height = height
        this.actor = actor
        this.ctx = ctx
        this.particles = []

    }

    public startTransition(type: TransitionType, particles: Array<Particle>) {
        this.particles = particles
        type === TransitionType.IN ? this.startIn() : this.startOut()
    }
    private startIn() {
        this.particles.forEach(particle => {
                particle.x = Math.random() * this.width
                particle.y = Math.random() * this.height
            }
        )
    }

    private startOut() {
        this.particles.forEach(particle => {
                particle.targetPositionX = Math.random() * this.width
                particle.targetPositionY = Math.random() * this.height
            }
        )
    }


    public use() {
        const state = this.actor.getSnapshot()
        this.particles.forEach(particle =>{
            particle.vx = particle.vx * particle.friction + (particle.targetPositionX - particle.x) * particle.ease
            particle.vy = particle.vy * particle.friction + (particle.targetPositionY - particle.y) * particle.ease
            particle.update(state.context.elapsedTimeMs)
            particle.draw()
        } )
    }


}