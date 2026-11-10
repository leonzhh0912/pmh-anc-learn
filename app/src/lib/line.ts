/**
 * LINE opens links in its own in-app browser, where the app cannot be added to the home screen and
 * progress is kept apart from Safari/Chrome. LINE documents a query parameter that makes it open the
 * link in the phone's own browser instead (LINE for iOS and Android; "Opening a URL in an external
 * browser", developers.line.biz/en/docs/line-login/using-line-url-scheme/). Other apps ignore it.
 */
export const LINE_EXTERNAL_PARAM = "openExternalBrowser";

export function withOpenExternal(url: string): string {
  const u = new URL(url);
  u.searchParams.set(LINE_EXTERNAL_PARAM, "1");
  return u.toString();
}

export const isLine = (ua = navigator.userAgent) => /\bLine\//.test(ua);
