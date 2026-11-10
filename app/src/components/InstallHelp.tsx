import { useEffect, useState } from "react";
import { isLine, withOpenExternal } from "../lib/line";

/**
 * Helps a family keep the app on their phone's home screen, so it opens like an app and
 * lessons they have opened work without internet.
 * - Android/Chrome: one button that opens the browser's own install dialog.
 * - iPhone/iPad Safari (no install dialog exists), other Android browsers: short written steps.
 * - Inside LINE / Facebook / Instagram (which cannot install): first step is to open in the phone's browser.
 * Hidden once the app runs from the home screen, or after "ไม่ใช่ตอนนี้".
 */
type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const KEY = "anc-learn:install-dismissed";
const read = () => {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};
const remember = () => {
  try {
    localStorage.setItem(KEY, "1");
  } catch {
    /* storage blocked: the card simply shows again next time */
  }
};

const standalone = () =>
  window.matchMedia?.("(display-mode: standalone)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;
const isAndroid = () => /Android/.test(navigator.userAgent);
const inAppBrowser = () => /\bLine\/|FBAN|FBAV|Instagram/.test(navigator.userAgent);
const isIos = () =>
  /iPhone|iPad|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

export function InstallHelp() {
  const [event, setEvent] = useState<InstallEvent | null>(null);
  const [hidden, setHidden] = useState(() => standalone() || read());
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault(); // show our own button instead of the browser's mini bar
      setEvent(e as InstallEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) {
    return (
      <p className="install install--done" role="status">
        เพิ่มแอปไว้ที่หน้าจอหลักแล้ว เปิดจากไอคอน ANC Learn ได้เลย
      </p>
    );
  }
  if (hidden || (!event && !isIos() && !isAndroid())) return null;
  const ios = isIos();
  const browser = ios ? "Safari" : "Chrome";

  const dismiss = () => {
    remember();
    setHidden(true);
  };

  return (
    <section className="install" aria-labelledby="install-title">
      <h2 id="install-title" className="install__title">
        เก็บแอปไว้ในมือถือ
      </h2>
      <p className="install__text">
        เปิดได้จากหน้าจอหลักเหมือนแอปทั่วไป ไม่ต้องดาวน์โหลดจากร้านแอป และบทเรียนที่เคยเปิดแล้วดูได้แม้ไม่มีอินเทอร์เน็ต
      </p>
      {event ? (
        <div className="install__actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={async () => {
              await event.prompt();
              const { outcome } = await event.userChoice;
              setEvent(null);
              if (outcome === "accepted") setInstalled(true);
            }}
          >
            เพิ่มไปยังหน้าจอหลัก
          </button>
          <button type="button" className="btn btn--quiet" onClick={dismiss}>
            ไม่ใช่ตอนนี้
          </button>
        </div>
      ) : (
        <>
          <ol className="install__steps">
            {inAppBrowser() &&
              (isLine() ? (
                <li>
                  <a className="install__open" href={withOpenExternal(window.location.href)}>
                    แตะที่นี่เพื่อเปิดใน {browser}
                  </a>{" "}
                  (หรือแตะปุ่ม ⋯ หรือ ⋮ ที่มุมจอ แล้วเลือกเปิดใน {browser})
                </li>
              ) : (
                <li>แตะปุ่ม ⋯ หรือ ⋮ ที่มุมจอ แล้วเลือกเปิดใน {browser}</li>
              ))}
            {ios ? (
              <>
                <li>
                  แตะปุ่มแชร์{" "}
                  <svg className="install__icon" viewBox="0 0 24 24" aria-label="(รูปสี่เหลี่ยมมีลูกศรชี้ขึ้น)" role="img">
                    <path d="M12 3v12M7.5 7.5 12 3l4.5 4.5M5 11v9h14v-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>{" "}
                  ที่แถบด้านล่างหรือด้านบนของจอ
                </li>
                <li>เลื่อนลงแล้วแตะ “เพิ่มไปยังหน้าจอโฮม”</li>
              </>
            ) : (
              <>
                <li>แตะปุ่มเมนู ⋮ ที่มุมขวาบนของ Chrome</li>
                <li>แตะ “เพิ่มลงในหน้าจอหลัก” หรือ “ติดตั้งแอป”</li>
              </>
            )}
          </ol>
          <div className="install__actions">
            <button type="button" className="btn btn--quiet" onClick={dismiss}>
              เข้าใจแล้ว
            </button>
          </div>
        </>
      )}
    </section>
  );
}
