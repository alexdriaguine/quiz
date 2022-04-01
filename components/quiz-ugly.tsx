import styles from './quiz-ugly.module.css';
import cn from 'classnames';
// @ts-ignore
import useSound from 'use-sound';
import { createQuizMachine, MAX_ROUNDS } from '../x-state/quiz-machine';
import classNames from 'classnames';
import { useMachine } from '@xstate/react';
import { useForm } from 'react-hook-form';
import { FUNNY_ACRONYMS } from '../data/funny-acronyms';
import { useEffect } from 'react';

export const Quiz: React.FC<{ changeToNormal: () => void }> = ({
  changeToNormal,
}) => {
  const [playWrong] = useSound('/wrong.mp3', { volume: 1 });
  const [playCorrect] = useSound('/correct.mp3', { volume: 1 });
  const [playEnd] = useSound('/slow_clap.wav', { volume: 1 });
  const [playFart] = useSound('/fart.wav', { volume: 1 });

  const [state, send] = useMachine(() =>
    createQuizMachine({
      acronyms: FUNNY_ACRONYMS,
      events: {
        onWrong: playWrong,
        onCorrect: playCorrect,
      },
    })
  );
  const { register, handleSubmit, resetField } = useForm<{ word: string }>();
  const {
    context: { currentAcronym },
  } = state;

  useEffect(() => {
    if (state.value === 'incorrect') playWrong();
    if (state.value === 'correct') playCorrect();
    if (state.value === 'end') playEnd();
  }, [state.value]);

  useEffect(() => {
    playFart();
  }, [playFart]);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <img src="/cat.gif" className={styles.cat} />
        <div className={classNames('card clay', styles.mainCard)}>
          <h1 className={styles.title}>✨VING QUIZ✨</h1>
          <p
            className={classNames(
              styles.description,
              styles.rainbow_text_animated
            )}
          >
            Gissa förkortningar!
          </p>
        </div>
        <div className={cn(styles.quiz, 'clay', 'card')}>
          <h1 className={styles.rainbow_text_animated}>SPELA NU</h1>

          <pre>
            {JSON.stringify(
              {
                state: state.value,
                points: state.context.points,
                currentRound: state.context.currentRound,
              },
              null,
              2
            )}
          </pre>
          {state.can('start_game') && (
            <button
              className={styles.button}
              onClick={() => send('start_game')}
            >
              Starta!
            </button>
          )}
          {state.can('next_guess') && (
            <button onClick={() => send('next_guess')}>
              {state.context.currentRound === MAX_ROUNDS ? 'SLUT' : 'NÄSTA'}
            </button>
          )}

          {state.value === 'correct' && (
            <p>
              Rätt gissat! ✈ {currentAcronym.short} betyder{' '}
              {currentAcronym.long} ✔
            </p>
          )}
          {state.value === 'incorrect' && <p>Tyvärr fel...💩💩💩</p>}

          {state.value === 'guessing' && (
            <>
              <p>Vad betyder detta?</p>
              <strong>{currentAcronym.short}</strong>
              <form
                onSubmit={handleSubmit(({ word }) => {
                  send('make_guess', { word });
                  resetField('word');
                })}
              >
                <input autoComplete="off" type="text" {...register('word')} />
                <button type="submit" className={styles.button}>
                  GISSA
                </button>
              </form>
            </>
          )}

          {state.value === 'end' && (
            <>
              <p>Slut</p>
              <p>
                Du fick {state.context.points} poäng av {MAX_ROUNDS} möjliga.
              </p>
            </>
          )}
        </div>
        <button onClick={changeToNormal}>💩💩🤖🤖✨✨</button>
        <marquee className={styles.madeby}>
          🍑🥒🍑Web 13 🔥 Web 13 🔥 Web 13 🔥 Web 13 🔥 Web 13 🔥 Web 13 🔥 Web
          13 🔥 Web 13 🔥 Web 13 🔥 Web 13 🔥 Web 13 🔥 Web 13 🔥 Web 13 🔥 Web
          13 🔥 Web 13 🔥 Web 13 🔥 Web 13 🔥 Web 13 🔥 Web 13 🔥 Web 13 🔥 Web
          13 🥒🍑🥒
        </marquee>
        <div className={styles.ball}>
          <b></b>
        </div>
      </main>
    </div>
  );
};
