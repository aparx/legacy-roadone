import { Navbar } from '@/components';
import { DialogHandleRenderer } from '@/stores/components/dialogHandle';
import * as style from '@/styles/app';
import '@/styles/reset.css';
import { theme } from '@/styles/theme';
import { api, queryClient } from '@/utils/api';
import { WindowBreakpointProvider } from '@/utils/context/windowBreakpoint';
import { roboto } from '@/utils/font';
import '@/utils/langset';
import { Global, ThemeProvider } from '@emotion/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import {
  AppRootProvider,
  ScrimRoot,
  TypefaceStyleClassProvider,
} from 'next-ui';
import { useRef } from 'react';

function App({ Component, pageProps: { session, ...pageProps } }) {
  const appRootRef = useRef<HTMLDivElement>(null);
  return (
    <AppRootProvider value={appRootRef}>
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <TypefaceStyleClassProvider value={{ roboto: roboto.className }}>
            <div id={'app-root'} css={style.appRoot} ref={appRootRef}>
              <Global styles={style.appGlobal} />
              <SessionProvider session={session}>
                <WindowBreakpointProvider>
                  <Navbar>
                    <Navbar.Page link={'/home'} name={'Home'} />
                    <Navbar.Page link={'/gigs'} name={'Auftritte'} />
                    <Navbar.Page link={'/media'} name={'Media'} />
                  </Navbar>
                  <ScrimRoot>
                    <Component {...pageProps} />
                    <DialogHandleRenderer />
                  </ScrimRoot>
                </WindowBreakpointProvider>
              </SessionProvider>
            </div>
          </TypefaceStyleClassProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </AppRootProvider>
  );
}

export default api.withTRPC(App);
