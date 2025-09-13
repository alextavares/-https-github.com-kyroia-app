import NextErrorComponent from 'next/error'
import type { NextPageContext } from 'next'

// Minimal _error to satisfy Next dev overlay when an error occurs.
function MyError({ statusCode }: { statusCode: number }) {
  return <NextErrorComponent statusCode={statusCode} />
}

MyError.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 404
  return { statusCode }
}

export default MyError

