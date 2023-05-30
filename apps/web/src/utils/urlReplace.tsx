import { DialogConfig } from '@/components';
import { DialogResponseSource } from '@/components/Dialog/Dialog';
import { useDialogHandle } from '@/handles';
import { getGlobalMessage } from '@/utils/message';
import { selfURL } from '@/utils/selfURL';
import { Stack, Text } from 'next-ui';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactElement, useMemo } from 'react';
import { regrepl, RegreplConfig } from 'shared-utils';

/** Array of hostnames that are whitelisted and don't need permission to forward. */
const hostnameWhitelist: readonly string[] = [selfURL.hostname] as const;

const regreplConfig: RegreplConfig<ReactElement> = {
  pattern:
    // This may be the most efficient way of actually parsing links effectively, using
    // raw URL objects would require customization that is unnecessary and unclean.
    // Performance of this regex is pretty good actually, getting 0.003ms/parse.
    /((?<protocol>http|https):\/\/)?(www\.)?(?<root>\S+)\.(?<domain>[A-z]{2,6})((?<appendix>\/[-a-zA-Z0-9()@:%_+.~#?&\/=]+[^.\s:;])?)?/gm,
  decorator: (m, i, result) => (
    <RedirectingLink url={m ? { full: m, ...result!.groups } : undefined} />
  ),
};

/**
 * Replaces URLs in `text` with `Link` React elements.
 *
 * @param text the target text to replace
 */
export const urlReplace = (text: string) => {
  return regrepl(regreplConfig, text);
};

export function useRegreplURL(text: string) {
  return useMemo(() => urlReplace(text), [text]);
}

// <==============================================>
//           REDIRECTING LINK COMPONENT(S)
// <==============================================>

const redirectingLinkActions = [
  { id: 'ok', name: getGlobalMessage('general.ok_forward') },
  DialogConfig.dialogCancelAction,
] as const satisfies DialogResponseSource;

// prettier-ignore
type RedirectingLinkProps = {
  url?: {
    /** Fully matched URL */
    full: string;
    /** HTTP protocol in use (optional; HTTPS by default) */
    protocol?: string;
    /** Root URL (hostname; optional) */
    root?: string;
    /** Top-Level-Domain (optional) */
    domain?: string;
    /** Pathname and search params (optional) */
    appendix?: string;
  } | undefined;
}

/**
 * Higher order component that returns another component depending on whether the in
 * `props` given URL is unsafe (as in not whitelisted here) or not.
 */
export function RedirectingLink(props: RedirectingLinkProps) {
  const { url } = props;
  const forward =
    url?.root &&
    !hostnameWhitelist.find((e) => {
      if (e.endsWith('.*')) return url.root === e.slice(0, -2);
      return `${url.root}.${url.domain}` === e;
    });
  let forwardedURL = url?.full ?? '#';
  // Automatically prefer https over http
  if (url?.full && !url?.protocol) forwardedURL = `https://${forwardedURL}`;
  return !forward ? (
    <Link href={forwardedURL}>{url?.full}</Link>
  ) : (
    <RedirectDialogAnchor displayURL={url} targetURL={forwardedURL} />
  );
}

/**
 * Component that represents an anchor tag that when clicked opens a Dialog to warn
 * the user about leaving the current site.
 *
 * @param props the properties, mainly the target URL
 */
export function RedirectDialogAnchor(props: {
  displayURL: NonNullable<RedirectingLinkProps['url']>;
  targetURL: string;
}) {
  const { displayURL, targetURL } = props;
  const showDialog = useDialogHandle((s) => s.show);
  const router = useRouter();
  return (
    <a
      href={targetURL}
      onClick={(e) => {
        e.preventDefault();
        showDialog({
          type: 'modal',
          actions: redirectingLinkActions,
          title: 'Du verlässt uns',
          width: 'sm',
          content: (
            <Stack spacing={'lg'}>
              <Stack direction={'row'} vAlign wrap vSpacing={0} hSpacing={'md'}>
                <span>
                  {getGlobalMessage('urlReplace.dialog_message_prefix')}
                </span>
                <Text.Body
                  as={'span'}
                  size={'lg'}
                  take={{ fontWeight: 'medium' }}
                  sd={{ color: (t) => t.sys.color.scheme.primary }}
                >
                  {(displayURL?.protocol ? `${displayURL?.protocol}://` : '') +
                    `${displayURL.root}.${displayURL.domain}`}{' '}
                </Text.Body>
                <span>
                  {getGlobalMessage('urlReplace.dialog_message_suffix')}
                </span>
              </Stack>
              <Text.Body size={'md'} emphasis={'medium'}>
                {getGlobalMessage('urlReplace.dialog_warning')}
              </Text.Body>
              {displayURL?.appendix && (
                <Text.Label size={'md'} emphasis={'low'}>
                  <span>Genau: {displayURL?.appendix}</span>
                </Text.Label>
              )}
            </Stack>
          ),
          /** Event called whenever the user accepts to be redirected */
          onHandleOk: async () => {
            await router.push(
              !displayURL?.protocol && displayURL?.full
                ? `https://${displayURL?.full}`
                : displayURL?.full
            );
          },
        });
      }}
    >
      {displayURL?.full}
    </a>
  );
}
