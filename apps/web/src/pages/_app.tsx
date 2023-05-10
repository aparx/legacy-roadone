import { Navbar } from '@/components';
import * as style from '@/styles/global';
import '@/styles/reset.css';
import { theme } from '@/styles/theme';
import { api, queryClient } from '@/utils/api';
import { WindowBreakpointProvider } from '@/utils/context/windowBreakpoint';
import { roboto } from '@/utils/font';
import { Global, ThemeProvider } from '@emotion/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { TypefaceStyleClassProvider } from 'next-ui';

function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <TypefaceStyleClassProvider value={{ roboto: roboto.className }}>
          <div id={'app-root'} css={{}}>
            <Global styles={style.global} />
            <SessionProvider session={session}>
              <WindowBreakpointProvider>
                <Navbar>
                  <Navbar.Page link={'/home'} name={'Home'} />
                  <Navbar.Page link={'/gigs'} name={'Auftritte'} />
                  <Navbar.Page link={'/media'} name={'Media'} />
                </Navbar>
                <Component {...pageProps} />
                {/* TODO dialog component, that can be opened and closed through
                    custom ref (passing down the necessary dialog data) */}
              </WindowBreakpointProvider>
            </SessionProvider>
          </div>
        </TypefaceStyleClassProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default api.withTRPC(App);
