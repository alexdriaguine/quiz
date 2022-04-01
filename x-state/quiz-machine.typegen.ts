// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  eventsCausingActions: {
    start: "start_game";
    add_point: "make_guess";
    save_guess: "make_guess";
    next_acronym: "next_guess";
    reset: "start_game";
    onCorrect: "make_guess";
    onIncorrect: "make_guess";
  };
  internalEvents: {
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {};
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingServices: {};
  eventsCausingGuards: {
    correct_guess: "make_guess";
    should_end: "next_guess";
  };
  eventsCausingDelays: {};
  matchesStates: "idle" | "guessing" | "correct" | "incorrect" | "end";
  tags: never;
}
