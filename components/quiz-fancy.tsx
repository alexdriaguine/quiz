import { createQuizMachine, MAX_ROUNDS } from '../x-state/quiz-machine';
import styles from './quiz-fancy.module.css';
import logo from '../public/ving-logo.png';
import Image from 'next/image';
import Button from './button';
import { useMachine } from '@xstate/react';
import { useForm } from 'react-hook-form';
import { VING_ACRONYMS } from '../data/acronyms';
import { useEffect } from 'react';

export const QuizFancy: React.FC<{ changeToUgly: () => void }> = ({
  changeToUgly,
}) => {
  const [state, send] = useMachine(() =>
    createQuizMachine({ acronyms: VING_ACRONYMS })
  );
  const { register, handleSubmit, resetField } = useForm<{ word: string }>();
  const {
    context: { currentAcronym },
  } = state;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logoContainer} style={{ marginBottom: 48 }}>
          <Image {...logo} alt="Ving logo" />
        </div>
        <div className={styles.start}>
          {state.matches('idle') && (
            <>
              <h1>Quiz - Gissa förkortningar!</h1>
              <p>
                Quizet består av 10st frågor inom BIT, den som svarar rätt på
                flest vinner
              </p>
            </>
          )}
          {state.can('start_game') && (
            <Button onClick={() => send('start_game')}>STARTA QUIZ</Button>
          )}
        </div>
        {state.can('next_guess') && (
          <Button onClick={() => send('next_guess')}>
            {state.context.currentRound === MAX_ROUNDS ? 'SLUT' : 'NÄSTA'}
          </Button>
        )}
        {state.value === 'correct' && (
          <p>
            Rätt gissat! ✈ {currentAcronym.short} betyder {currentAcronym.long}{' '}
            ✔
          </p>
        )}
        {state.value === 'incorrect' && <p>Tyvärr fel...💩💩💩</p>}
        {state.value === 'guessing' && (
          <>
            <p>Vad betyder detta?</p>
            <strong style={{ fontSize: 36, marginBottom: 24 }}>
              {currentAcronym.short}
            </strong>
            <form
              onSubmit={handleSubmit(({ word }) => {
                send('make_guess', { word });
                resetField('word');
              })}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <input
                autoComplete="off"
                type="text"
                className={styles.inputField}
                {...register('word')}
                style={{ fontSize: 24, borderRadius: 8, marginBottom: 36 }}
              />
              <Button type="submit">GISSA</Button>
            </form>
          </>
        )}
        {state.value === 'end' && (
          <>
            <p>Slut</p>
            <p>
              Du fick {state.context.points} poäng av {MAX_ROUNDS} möjliga.
            </p>
            <table>
              <thead>
                <th>gissning</th>
                <th>förkortning</th>
                <th>rätt</th>
              </thead>
              <tbody>
                {state.context.guesses.map((x) => (
                  <tr key={x.correct}>
                    <td>{x.guess}</td>
                    <td>{x.short}</td>
                    <td>{x.correct}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        {/* <button style={{ marginTop: '160px' }} onClick={changeToUgly}>
          💩💩🤖🤖✨✨
        </button> */}
      </div>
    </div>
  );
};
