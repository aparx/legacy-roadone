/**
 * Determines the URL of the currently running environment.
 */
export const selfURL: URL = (function () {
  if (process.env.NEXT_PUBLIC_SELF_URL)
    return new URL(`https://${process.env.NEXT_PUBLIC_SELF_URL}`);
  throw new Error('Missing "NEXT_PUBLIC_SELF_URL" as environment variable');
})();
