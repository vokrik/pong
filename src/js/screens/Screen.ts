import {Actor} from "xstate";
import {gamesState} from "../state";
import TransitionEffect, {TransitionType} from "../effects/TransitionEffect";
import Particle from "../gameObjects/Particle";

export abstract class Screen {

    protected ctx: CanvasRenderingContext2D
    protected actor
    protected width: number
    protected height: number
    private hasTransitionStarted
    private transitionEffect
    protected readonly name:String

    constructor(name: String, width: number, height: number,actor: Actor<typeof gamesState>, ctx: CanvasRenderingContext2D) {
        this.name = name
        this.width = width
        this.height = height
        this.ctx = ctx
        this.actor = actor
        this.hasTransitionStarted = false
        this.transitionEffect = new TransitionEffect(width, height, actor, ctx)
    }


    protected abstract idleUpdate(): void
    protected abstract getTransitionParticles(): Array<Particle>
    protected abstract alwaysUpdate(): void
    protected update()
    {
        const state = this.actor.getSnapshot()
        if(state.matches({[this.name as string]: "Transition In"})) {
            if (!this.hasTransitionStarted) {
                this.transitionEffect.startTransition(TransitionType.IN, this.getTransitionParticles())
                this.hasTransitionStarted = true
            }
            this.transitionEffect.use()
        }
        if(state.matches({[this.name as string]: "Idle"})){
            this.hasTransitionStarted = false
            this.idleUpdate()
        }
        if(state.matches({[this.name as string]: "Transition Out"})){
            if(!this.hasTransitionStarted){
                this.transitionEffect.startTransition(TransitionType.OUT, this.getTransitionParticles())
                this.hasTransitionStarted = true
            }
            this.transitionEffect.use()
        }
        this.alwaysUpdate()
    }



}