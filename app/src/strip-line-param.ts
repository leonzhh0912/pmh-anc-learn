// Runs before the router starts (imported first in main.tsx): drop LINE's ?openExternalBrowser=1 from the
// address bar, so bookmarks, shared links and the home-screen icon keep the plain address.
import { LINE_EXTERNAL_PARAM } from "./lib/line";

const url = new URL(window.location.href);
if (url.searchParams.has(LINE_EXTERNAL_PARAM)) {
  url.searchParams.delete(LINE_EXTERNAL_PARAM);
  window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
}
