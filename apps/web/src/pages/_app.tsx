import * as style from '@/styles/global';
import '@/styles/reset.css';
import { theme } from '@/styles/theme';
import { api } from '@/utils/api';
import { roboto } from '@/utils/font';
import { Global, ThemeProvider } from '@emotion/react';
import { TypefaceStyleClassProvider } from 'next-ui';

function App({ Component, pageProps }) {
  return (
    <div id={'app-root'} css={{}}>
      <ThemeProvider theme={theme}>
        <TypefaceStyleClassProvider value={{ roboto: roboto.className }}>
          <Global styles={style.global} />
          <Component {...pageProps} />
        </TypefaceStyleClassProvider>
      </ThemeProvider>
    </div>
  );
}

export default api.withTRPC(App);
