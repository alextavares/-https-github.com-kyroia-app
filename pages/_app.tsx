import type { AppProps } from 'next/app'

// Minimal _app to satisfy dev error components in Pages Router.
export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

