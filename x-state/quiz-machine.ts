import { assign, createMachine } from 'xstate';

type Acronym = {
  short: string;
  long: string[];
};

type Context = {
  points: number;
  acronyms: Acronym[];
  currentAcronym: Acronym;
  currentRound: number;
};

type MakeGuessEvent = { type: 'make_guess'; word: string };
type StartGameEvent = { type: 'start_game' };
type NextGuessEvent = { type: 'next_guess' };
type Events = MakeGuessEvent | StartGameEvent | NextGuessEvent;

type MachineOptions = {
  acronyms: Acronym[];
  events?: {
    onWrong: () => void;
    onCorrect: () => void;
  };
};

export const MAX_ROUNDS = 5;
export const createQuizMachine = ({ acronyms, events }: MachineOptions) =>
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOlwgBswBiWAF3QCc6B9KdVMRUABwHtYuOrj75uIAB6IAtABYAHAEYSAZgCcAVg2L5ANln7Za3boA0IAJ4yATAHZdJNYoAMuxbduK1x3RoC+fuZoWHiEpFAArnCC+FDUGADWYGxRsPBIIPyCwqLiUgjSXg7yKirOiip21nZqtuZWBbYktrLqdroqGrrORs7+gSDBOATEJJh8jIxgmHTUhBKskdHiWUIiYhn5irpNGrLW5bK21irdPWaWMk0tbfad3b39QRjDYWT445PTs-OLqem8ARrXKbRDbXb7Q7HU7Oc71GzbZqtNQqWzaDTtRTWALPEIjUhgfAQWgMZhsDhcDKrHIbUD5ayyZTOWyVfTbDrOazyeEFMoqJHqLrWRSyZkaeS2AIDfB8CBwcRDUKjchUFZAml5GRufmC7SaTQqBR1S4FLnWRwuXTWbT6DTeXQ4wYvJXhf4EKBq7LrTW8jQ6hT6XzGI66eSyHnSM0W1zW7ayO3GR2K-FjCZTGae4G0ySIaqqE52VoSkoeLk8kzNLrOeRc2Si4y1JPOlMET7puiZjWghCI4UqeTycUig4qLwaCPDkgM27OToaFrWpt4t6EiCd73d05qEhY8qnYVWtHGhqFdQCtR2WdaBdPJ3L4jrkF0rWo1SaPV2v1GiOohw3NTxhUrStKUUp+EAA */
  createMachine(
    {
      context: {
        points: 0,
        acronyms,
        currentRound: 1,
        currentAcronym: { short: '', long: [] },
      },
      tsTypes: {} as import('./quiz-machine.typegen').Typegen0,
      schema: {
        context: {} as Context,
        events: {} as Events,
      },
      initial: 'idle',
      states: {
        idle: {
          on: {
            start_game: {
              target: 'guessing',
              actions: 'start',
            },
          },
        },
        guessing: {
          on: {
            make_guess: [
              {
                actions: 'add_point',
                cond: 'correct_guess',
                target: 'correct',
              },
              {
                target: 'incorrect',
              },
            ],
          },
        },
        correct: {
          entry: 'onCorrect',
          on: {
            next_guess: [
              {
                cond: 'should_end',
                target: 'end',
              },
              {
                actions: 'next_acronym',
                target: 'guessing',
              },
            ],
          },
        },
        incorrect: {
          entry: 'onIncorrect',
          on: {
            next_guess: [
              {
                cond: 'should_end',
                target: 'end',
              },
              {
                actions: 'next_acronym',
                target: 'guessing',
              },
            ],
          },
        },
        end: {
          on: {
            start_game: {
              actions: 'reset',
              target: 'guessing',
            },
          },
        },
      },
      id: 'QUIZ_MACHINE',
    },
    {
      actions: {
        add_point: assign({ points: (context) => context.points + 1 }),
        next_acronym: assign({
          currentAcronym: (context) => {
            const next = shuffle(context.acronyms).shift()!;
            return next;
          },
          currentRound: (context) => context.currentRound + 1,
        }),
        reset: assign({
          points: (_) => 0,
          currentRound: (_) => 0,
        }),
        start: assign({
          acronyms: (_) => shuffle(acronyms),
          currentAcronym: (context) => {
            const next = shuffle(context.acronyms).shift()!;
            return next;
          },
        }),
        onCorrect: () => events?.onCorrect(),
        onIncorrect: () => events?.onWrong(),
      },
      guards: {
        should_end: (context) => {
          return context.currentRound === MAX_ROUNDS;
        },
        correct_guess: ({ currentAcronym }, event) => {
          return currentAcronym.long.some(
            (l) =>
              l.replaceAll(/\ /g, '') ===
              event.word.replaceAll(/\ /g, '').toLowerCase()
          );
        },
      },
    }
  );

function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  let currentIndex = newArray.length;
  let temporaryValue;
  let randomIndex;
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = newArray[currentIndex];
    newArray[currentIndex] = newArray[randomIndex];
    newArray[randomIndex] = temporaryValue;
  }
  return newArray;
}
