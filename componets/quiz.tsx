import styles from './quiz.module.css';
import { useMachine } from '@xstate/react';
import { assign, createMachine } from 'xstate';
import { useForm } from 'react-hook-form';
import { VING_ACRONYMS } from '../data/acronyms';

type Acronym = {
  short: string;
  long: string;
};

type Context = {
  points: number;
  acronyms: Acronym[];
  currentWordIndex: number;
};

type MakeGuessEvent = { type: 'make_guess'; word: string };
type StartGameEvent = { type: 'start_game' };
type NextGuessEvent = { type: 'next_guess' };
type Events = MakeGuessEvent | StartGameEvent | NextGuessEvent;

type MachineOptions = {
  acronyms: Acronym[];
};
const createQuizMachine = ({ acronyms }: MachineOptions) =>
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOlwgBswBiWAF3QCc6B9KdVMRUABwHtYuOrj75uIAB6IAtABYArAE4SCgIwAOebIDM2gOxKAbPIA0IAJ4yATHvUkADIuPr7e1avl7HAX29m0WHiEpFAArnCC+FDUGADWYGzhsPBIIPyCwqLiUgjS8tqyKm4eitryhor2qoZmlrmG1SSGsrJ6FXoFmm2+-hg4BMQkmHyMjGCYdNSEEqxhEeLpQiJiqTlySiryGlq6Bk6mFjLaxg77Csfa9lay6j0gAf3BZPjDo+OT07NJKbwCS1mrGQKZRqTQ6fRGA51aRWKx2SHaRSKWRWRSqHS3O74PgQODiB5BQbkKgLP6ZFagNZGTbbQywuHyKzaWrWdSFRzOFrqKz2bkKO4EgYhb4EKCkjLLbLWKyqFT2WSKdTVZHVOnqFm5Jn2Eio4xuZFbbTowwCvqE0ivMYTcX-CmSGSGezaEjldxsxzozw1Q65Y6ylFI3lG+zyNnyeSmwJC56W9428lS+qqbV6PRI2Gp9NwjUwjynYyGPUyxk3SOPYjxyWA+oFEiZxQZtMN7M+6SGdTKZqtfKtBRWZq+XxAA */
  createMachine<Context, Events>(
    {
      context: {
        points: 0,
        acronyms,
        currentWordIndex: 0,
      },
      initial: 'idle',
      states: {
        idle: {
          on: {
            start_game: {
              target: 'guessing',
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
          on: {
            next_guess: {
              actions: 'next_acronym',
              target: 'guessing',
            },
          },
        },
        incorrect: {
          on: {
            next_guess: {
              actions: 'next_acronym',
              target: 'guessing',
            },
          },
        },
      },
      id: '(machine)',
    },
    {
      actions: {
        add_point: assign({ points: (context) => context.points + 1 }),
        next_acronym: assign({
          currentWordIndex: (context) => {
            let next = context.currentWordIndex + 1;
            if (next === context.acronyms.length) {
              next = 0;
            }
            return next;
          },
        }),
      },
      guards: {
        correct_guess: ({ acronyms, currentWordIndex }, event) => {
          if (event.type !== 'make_guess') {
            return false;
          }
          const { long: actualWord } = acronyms[currentWordIndex];
          return actualWord.toLowerCase() === event.word.toLowerCase();
        },
      },
    }
  );

export const Quiz: React.FC = () => {
  const [state, send] = useMachine(() =>
    createQuizMachine({ acronyms: VING_ACRONYMS })
  );
  const { register, handleSubmit, resetField } = useForm<{ word: string }>();
  const {
    context: { acronyms, currentWordIndex },
  } = state;

  const currentAcronym = acronyms[currentWordIndex];
  return (
    <div className={styles.quiz}>
      <pre>
        {JSON.stringify(
          { state: state.value, points: state.context.points },
          null,
          2
        )}
      </pre>
      {state.can('start_game') && (
        <button onClick={() => send('start_game')}>Starta!</button>
      )}
      {state.can('next_guess') && (
        <button onClick={() => send('next_guess')}>Nästa</button>
      )}

      {state.value === 'correct' && (
        <p>
          Rätt gissat! {currentAcronym.short} betyder {currentAcronym.long}
        </p>
      )}
      {state.value === 'incorrect' && <p>Tyvärr fel..</p>}

      {state.value === 'guessing' && (
        <>
          <p>Vad betyder detta?</p>
          <strong>{currentAcronym.short}</strong>
          <form
            onSubmit={handleSubmit((data) => {
              send('make_guess', { word: data.word });
              resetField('word');
            })}
          >
            <input type="text" {...register('word')} />
            <input type="submit" />
          </form>
        </>
      )}
    </div>
  );
};
