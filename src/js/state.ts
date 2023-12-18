import {assign, createMachine} from "xstate";
import Pong from "./Pong";

const MAX_ELAPSED_TIME_MS = 50
// export const gamesState = createMachine(
//     {
//         id: "Game state",
//         initial: "Display menu",
//         context: {
//             lastTickTime: performance.now(),
//             currentTickTime: performance.now(),
//             elapsedTimeMs: 0,
//             ticks: 0
//         },
//         on: {
//             Tick: {
//                 actions: assign(({context}) => {
//                     const lastTickTime = context.currentTickTime
//                     const currentTickTime = performance.now()
//                     return {
//                         lastTickTime,
//                         currentTickTime,
//                         elapsedTimeMs: Math.min(currentTickTime - lastTickTime, MAX_ELAPSED_TIME_MS),
//                         ticks: context.ticks + 1
//                     }
//
//                 }),
//             },
//         },
//         states: {
//             "Display menu": {
//                 on: {
//                     "Press Enter": {
//                         target: "Play game",
//                     },
//                 },
//             },
//             "Play game": {
//                 states: {
//                     Player: {
//                         initial: "Idle",
//                         states: {
//                             "Idle": {
//                                 on: {
//                                     "Press Up": {
//                                         target: "Moving up",
//                                     },
//                                     "Press Down": {
//                                         target: "Moving down",
//                                     },
//                                 },
//                             },
//                             "Moving up": {
//                                 on: {
//                                     "Release Up": {
//                                         target: "Idle",
//                                     },
//                                 },
//                             },
//                             "Moving down": {
//                                 on: {
//                                     "Release Down": {
//                                         target: "Idle",
//                                     },
//                                 },
//                             },
//                         },
//                     },
//                 },
//                 type: "parallel",
//             },
//         },
//         types: {
//             events: {} as
//                 | { type: "Press Enter" }
//                 | { type: "Press Up" }
//                 | { type: "Release Up" }
//                 | { type: "Press Down" }
//                 | { type: "Release Down" }
//                 | { type: "Tick" }
//             ,
//             context: {} as {
//                 elapsedTimeMs: number
//                 currentTickTime: number
//                 lastTickTime: number
//                 ticks: number
//             },
//         },
//     },
//     {
//         actions: {},
//         actors: {},
//         guards: {},
//         delays: {},
//     },
// );

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
        initial: "Display menu",
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
                always: [
                    {
                        target: "#Game state.Game over.Player Won",
                        guard: "Player Win Guard",
                    },
                    {
                        target: "#Game state.Game over.Player Lost",
                        guard: "Player Loose Guard",
                    },
                ],
                type: "parallel",
            },
            "Game over": {
                initial: "Player Won",
                states: {
                    "Player Won": {},
                    "Player Lost": {},
                },
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
                return context.score.player >= 2;
            },
            "Player Loose Guard": ({ context, event }, params) => {
                return context.score.opponent >= 2;
            },
        },
        delays: {},
    },
);