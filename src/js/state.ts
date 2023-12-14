import {assign, createMachine} from "xstate";

const MAX_ELAPSED_TIME_MS = 20
export const gamesState = createMachine(
    {
        id: "Game state",
        initial: "Display menu",
        context: {
            lastTickTime: performance.now(),
            currentTickTime: performance.now(),
            elapsedTimeMs: 0,
            ticks: 0
        },
        on: {
            Tick: {
                actions: assign(({context}) => {
                    const lastTickTime = context.currentTickTime
                    const currentTickTime = performance.now()
                    return {
                        lastTickTime,
                        currentTickTime,
                        elapsedTimeMs: Math.min(currentTickTime - lastTickTime, MAX_ELAPSED_TIME_MS),
                        ticks: context.ticks + 1
                    }

                }),
            },
        },
        states: {
            "Display menu": {
                on: {
                    "Press Enter": {
                        target: "Play game",
                    },
                },
            },
            "Play game": {
                states: {
                    Player: {
                        initial: "Idle",
                        states: {
                            "Idle": {
                                on: {
                                    "Press Up": {
                                        target: "Moving up",
                                    },
                                    "Press Down": {
                                        target: "Moving down",
                                    },
                                },
                            },
                            "Moving up": {
                                on: {
                                    "Release Up": {
                                        target: "Idle",
                                    },
                                },
                            },
                            "Moving down": {
                                on: {
                                    "Release Down": {
                                        target: "Idle",
                                    },
                                },
                            },
                        },
                    },
                },
                type: "parallel",
            },
        },
        types: {
            events: {} as
                | { type: "Press Enter" }
                | { type: "Press Up" }
                | { type: "Release Up" }
                | { type: "Press Down" }
                | { type: "Release Down" }
                | { type: "Tick" }
            ,
            context: {} as {
                elapsedTimeMs: number
                currentTickTime: number
                lastTickTime: number
                ticks: number
            },
        },
    },
    {
        actions: {},
        actors: {},
        guards: {},
        delays: {},
    },
);