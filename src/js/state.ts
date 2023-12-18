import {assign, createMachine} from "xstate";
import Pong from "./Pong";
import {WIN_SCORE} from "./constants";

const MAX_ELAPSED_TIME_MS = 50
export const gamesState = createMachine(
    {
        context: {
            lastTickTime: performance.now(),
            currentTickTime: performance.now(),
            elapsedTimeMs: 0,
            ticks: 0,
            score: {
                player: 0,
                opponent: 0
            }
        },
        id: "Game state",
        initial: "Title screen",
        states: {

            "Title screen": {
                initial: "Transition In",
                states: {
                    "Transition In": {
                        after: {
                            "1000": {
                                target: "#Game state.Title screen.Idle",
                                actions: [],
                            },
                        },
                    },
                    "Idle": {
                        on: {
                            "Press Enter": {
                                target: "#Game state.Title screen.Transition Out",
                            },
                        },
                    },
                    "Transition Out": {
                        after: {
                            "1000": {
                                target: "#Game state.Game screen",
                                actions: [],
                            },
                        },
                    },
                },

            },
            "Game screen": {
                initial: "Transition In",
                states: {
                    "Transition In": {
                        after: {
                            "1000": {
                                target: "#Game state.Game screen.Idle",
                                actions: [],
                            },
                        },
                    },
                    "Idle": {
                        initial: "Player",
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
                        always: [
                            {
                                target: "#Game state.Game over screen",
                                guard: "Player Win Guard",
                            },
                            {
                                target: "#Game state.Game over screen",
                                guard: "Player Loose Guard",
                            },
                        ],
                        type: "parallel",
                    },
                    "Transition Out": {
                        after: {
                            "1000": {
                                target: "#Game state.Game over screen",
                                actions: [],
                            },
                        },
                    },
                },

            },
            "Game over screen": {
            },
        },
        on: {
            Tick: {
                actions: assign(({ context }) => {
                    const lastTickTime = context.currentTickTime;
                    const currentTickTime = performance.now();
                    return {
                        lastTickTime,
                        currentTickTime,
                        elapsedTimeMs: Math.min(currentTickTime - lastTickTime, MAX_ELAPSED_TIME_MS),
                        ticks: context.ticks + 1,
                    };
                }),
            },
            "Player Score": {
                actions: assign(({ context }) => {
                    return {
                        ...context,
                        score: {
                            player: context.score.player + 1,
                            opponent: context.score.opponent
                        }
                    }
                }),
            },
            "Opponent Score": {
                actions: assign(({ context }) => {
                    return {
                        ...context,
                        score: {
                            player: context.score.player,
                            opponent: context.score.opponent + 1
                        }
                    }
                }),
            }
        },
        types: {
            events: {} as
                | { type: "Press Enter" }
                | { type: "Press Up" }
                | { type: "Press Down" }
                | { type: "Release Up" }
                | { type: "Release Down" }
                | { type: "Tick" }
                | { type: "Player Score" }
                | { type: "Opponent Score" },
            context: {} as {
                score: {
                    player: number
                    opponent: number
                }
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
        guards: {
            "Player Win Guard": ({ context, event }, params) => {
                return context.score.player >= WIN_SCORE;
            },
            "Player Loose Guard": ({ context, event }, params) => {
                return context.score.opponent >= WIN_SCORE;
            },
        },
        delays: {},
    },
);