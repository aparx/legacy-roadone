import { css, keyframes, Theme } from '@emotion/react';

export const skeletonKeyframes = keyframes({
  from: {
    backgroundPosition: '100%',
  },
  to: {
    backgroundPosition: '0%',
  },
});

export const skeleton = (
  theme: Theme,
  baseColor: string,
  scanColor: string
) => css`
  background-image: linear-gradient(
    to right,
    ${baseColor} 30%,
    ${scanColor} 40%,
    ${baseColor} 45%
  );
  background-size: 600%;
  background-position: 100%;
  animation: ${skeletonKeyframes} 1s linear infinite;
`;
