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

  useEffect(() => {
    const handleKeyPress = (e) => {};
    window.addEventListener('keypress', handleKeyPress);

    return () => {};
  }, []);
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logoContainer}>
          <Image {...logo} alt="Ving logo" />
        </div>
        {state.can('start_game') && (
          <div className={styles.start}>
            <h1>Quiz - Gissa förkortningar!</h1>
            <p>
              Quizet består av 10st frågor inom BIT, den som svarar rätt på
              flest vinner
            </p>
            <Button onClick={() => send('start_game')}>STARTA QUIZ</Button>
          </div>
        )}
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
            <strong>{currentAcronym.short}</strong>
            <form
              onSubmit={handleSubmit(({ word }) => {
                send('make_guess', { word });
                resetField('word');
              })}
            >
              <input
                autoComplete="off"
                type="text"
                className={styles.inputField}
                {...register('word')}
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
          </>
        )}
        <button style={{ marginTop: '160px' }} onClick={changeToUgly}>
          💩💩🤖🤖✨✨
        </button>
      </div>
    </div>
  );
};
