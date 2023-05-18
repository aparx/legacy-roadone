/** @jsxImportSource @emotion/react */
import { Globals } from '@/utils/global/globals';
import { useTheme } from '@emotion/react';
import { NextSeo } from 'next-seo';
import { NextSeoProps } from 'next-seo/lib/types';
import {
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
  PropsWithChildren<{ name: string; pageURL: string; meta?: NextSeoProps }>
>;

export default function Page({
  children,
  name,
  pageURL,
  meta,
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
          url: `https://${process.env.NEXT_PUBLIC_SELF_URL}/${pageURL}`,
          description: meta?.description,
          locale: Globals.siteLocale,
        }}
      />
      <PageAlign
        {...propMerge(
          usePinpointTextProps({ role: 'body', size: 'md' }),
          useStyleableMerge(restProps)
        )}
      >
        {children}
      </PageAlign>
    </>
  );
}
