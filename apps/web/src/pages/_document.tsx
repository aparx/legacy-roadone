import { portalId } from 'next-ui';
import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang='de'>
      <Head />
      <body>
        <Main />
        <NextScript />
        <div id={portalId} />
      </body>
    </Html>
  );
}