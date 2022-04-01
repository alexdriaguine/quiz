import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import { useKonami } from 'react-konami-code';
import { QuizFancy } from '../components/quiz-fancy';
import { Quiz } from '../components/quiz-ugly';

const Home: NextPage = () => {
  const [showUgly, setShowUgly] = useState(false);
  useKonami(() => setShowUgly(true));

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generat ed by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {showUgly ? (
        <Quiz changeToNormal={() => setShowUgly(false)} />
      ) : (
        <QuizFancy changeToUgly={() => setShowUgly(false)} />
      )}
    </div>
  );
};

export default Home;
