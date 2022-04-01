import '../styles/globals.css';
import 'claymorphism-css/dist/clay.css';
import styles from './_app.module.css';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
