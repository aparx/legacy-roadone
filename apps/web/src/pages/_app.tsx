import { Navbar } from '@/components';
import * as style from '@/styles/global';
import '@/styles/reset.css';
import { theme } from '@/styles/theme';
import { api } from '@/utils/api';
import { WindowBreakpointProvider } from '@/utils/context/windowBreakpoint';
import { roboto } from '@/utils/font';
import { Global, ThemeProvider } from '@emotion/react';
import { SessionProvider } from 'next-auth/react';
import { TypefaceStyleClassProvider } from 'next-ui';

function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <div id={'app-root'} css={{}}>
      <ThemeProvider theme={theme}>
        <TypefaceStyleClassProvider value={{ roboto: roboto.className }}>
          <Global styles={style.global} />
          <SessionProvider session={session}>
            <WindowBreakpointProvider>
              <Navbar>
                <Navbar.Page link={'/home'} name={'Home'} />
                <Navbar.Page link={'/media'} name={'Media'} />
              </Navbar>
              <Component {...pageProps} />
            </WindowBreakpointProvider>
          </SessionProvider>
        </TypefaceStyleClassProvider>
      </ThemeProvider>
    </div>
  );
}

export default api.withTRPC(App);
