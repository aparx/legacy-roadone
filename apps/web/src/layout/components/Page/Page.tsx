/** @jsxImportSource @emotion/react */
import { Footer } from '@/layout/components/Footer';
import { Globals } from '@/utils/global/globals';
import { useTheme } from '@emotion/react';
import { NextSeo } from 'next-seo';
import { NextSeoProps } from 'next-seo/lib/types';
import {
  HTMLTag,
  PageAlign,
  propMerge,
  PropsWithStyleable,
  useStyleableMerge,
} from 'next-ui';
import { usePinpointTextProps } from 'next-ui/src/components/Text/Text';
import { OpenGraphMetadata } from 'next/dist/lib/metadata/generate/opengraph';
import { PropsWithChildren } from 'react';

// => we might not even need `PropsWithStyleable` (performance waste?)
export type PageProps = PropsWithStyleable<
  PropsWithChildren<{
    name: string;
    page: string;
    meta?: NextSeoProps;
    as?: HTMLTag;
  }>
>;

export const CONTENT_TOP_MARGIN = 'xxl';

export default function Page({
  children,
  name,
  page,
  meta,
  as,
  ...restProps
}: PageProps) {
  const theme = useTheme();
  return (
    <>
      <NextSeo
        title={name}
        titleTemplate={`${process.env.NEXT_PUBLIC_SELF_URL} | %s`}
        description={meta?.description}
        themeColor={theme.sys.color.surface[1]}
        {...meta}
      />
      <OpenGraphMetadata
        openGraph={{
          type: 'website',
          url: `https://${process.env.NEXT_PUBLIC_SELF_URL}/${page}`,
          description: meta?.description,
          locale: Globals.siteLocale,
        }}
      />
      <div style={{ minHeight: '100dvh' }}>
        <PageAlign
          as={as}
          {...propMerge(
            {
              style: {
                marginTop: theme.rt.multipliers.spacing(CONTENT_TOP_MARGIN),
              },
            },
            usePinpointTextProps({ role: 'body', size: 'md' }),
            useStyleableMerge(restProps)
          )}
        >
          {children}
        </PageAlign>
      </div>
      <div style={{ marginTop: theme.rt.multipliers.spacing('xxl') }}>
        <Footer />
      </div>
    </>
  );
}
