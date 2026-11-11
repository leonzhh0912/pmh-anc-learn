import { useEffect } from "react";
import { createBrowserRouter, Link, Navigate, Outlet, RouterProvider, useLocation } from "react-router";
import { AboutPage } from "./pages/AboutPage";
import { HomePage } from "./pages/HomePage";
import { LessonPage } from "./pages/LessonPage";
import { SectionPage } from "./pages/SectionPage";
import { setTextScale, useProgress } from "./lib/progress";
import { allApproved } from "./content/load";
import { TutorialPage } from "./pages/TutorialPage";
import { HelpPage } from "./pages/HelpPage";
import { accountsEnabled, openWithoutLogin, requireLogin } from "./account/config";
import { startAccounts, useSession } from "./account/session";
import { SyncStatus } from "./account/SyncStatus";
import "./App.css";

startAccounts();

const scales = [
  { value: 1, label: "ขนาดตัวอักษรปกติ" },
  { value: 1.15, label: "ขนาดตัวอักษรใหญ่" },
  { value: 1.3, label: "ขนาดตัวอักษรใหญ่มาก" },
] as const;

function AccountLink() {
  const s = useSession();
  if (!accountsEnabled || s.phase === "loading") return null;
  if (s.phase === "signed-in" && s.account.kind === "learner") return <SyncStatus />;
  if (s.phase === "signed-in" && s.account.kind === "staff")
    return (
      <Link to="/staff" className="topbar__account">
        เจ้าหน้าที่
      </Link>
    );
  return (
    <Link to="/signin" className="topbar__account">
      เข้าสู่ระบบ
    </Link>
  );
}

/** Sign-in first (when switched on): everything except the pages that explain how to sign in. */
function LoginGate() {
  const s = useSession();
  const loc = useLocation();
  if (!requireLogin || openWithoutLogin.some((p) => loc.pathname === p || loc.pathname.startsWith(p + "/"))) return <Outlet />;
  if (s.phase === "loading") return <main className="page"><p role="status">กำลังโหลด…</p></main>;
  if (s.phase !== "signed-in") return <Navigate to={`/signin?next=${encodeURIComponent(loc.pathname + loc.search)}`} replace />;
  return <Outlet />;
}

function Shell() {
  const { textScale } = useProgress();
  useEffect(() => {
    document.documentElement.style.setProperty("--scale", String(textScale));
  }, [textScale]);

  return (
    <>
      <a className="skip" href="#main">
        ข้ามไปยังเนื้อหา
      </a>
      <header className="topbar">
        <Link to="/" className="topbar__brand">
          <span className="topbar__mark" aria-hidden="true" />
          <span>
            <span className="topbar__name">ANC Learn</span>
            <span className="topbar__org">โรงพยาบาลพิมาย</span>
          </span>
        </Link>
        <AccountLink />
        <div className="textsize" role="group" aria-label="ขนาดตัวอักษร">
          {scales.map((s, i) => (
            <button
              key={s.value}
              type="button"
              className="textsize__btn"
              style={{ fontSize: `${16 + i * 4}px` }}
              aria-pressed={textScale === s.value}
              aria-label={s.label}
              onClick={() => setTextScale(s.value)}
            >
              ก
            </button>
          ))}
        </div>
      </header>
      <div id="main">
        <LoginGate />
      </div>
      <footer className="footer">
        <p>
          {allApproved ? "" : "ต้นแบบเพื่อการทดสอบ "}เนื้อหาอ้างอิงสมุดบันทึกสุขภาพแม่และเด็ก ฉบับปรับปรุงใหม่ พ.ศ. 2568 กรมอนามัย
          ไม่ใช่เครื่องมือวินิจฉัยโรค
        </p>
        <p className="footer__links">
          <Link to="/help">วิธีใช้งานและช่วยเหลือ</Link>
          <Link to="/about">เกี่ยวกับแอปและข้อมูลของคุณ</Link>
        </p>
      </footer>
    </>
  );
}

const router = createBrowserRouter(
  [
    {
      element: <Shell />,
      children: [
        { path: "/", element: <HomePage /> },
        { path: "/section/:sectionId", element: <SectionPage /> },
        { path: "/lesson/:lessonId", element: <LessonPage /> },
        { path: "/about", element: <AboutPage /> },
        { path: "/start", element: <TutorialPage /> },
        { path: "/help", element: <HelpPage /> },
        {
          // learner sign-in (loaded on demand: phone-number library, auth client)
          path: "/signin",
          lazy: async () => ({ Component: (await import("./pages/account/SignInPage")).SignInPage }),
        },
        {
          // learner's own account and sync status
          path: "/account",
          lazy: async () => ({ Component: (await import("./pages/account/AccountPage")).AccountPage }),
        },
        {
          // privacy notice for accounts (DRAFT, needs PMH review)
          path: "/privacy",
          lazy: async () => ({ Component: (await import("./pages/account/PrivacyPage")).PrivacyPage }),
        },
        {
          // staff: sign-in, second factor, learner list (data only via audited server functions)
          path: "/staff",
          lazy: async () => ({ Component: (await import("./pages/staff/StaffPage")).StaffPage }),
        },
        {
          // staff: one learner's recorded progress
          path: "/staff/learner/:learnerId",
          lazy: async () => ({ Component: (await import("./pages/staff/StaffLearnerPage")).StaffLearnerPage }),
        },
        {
          // administrators: staff accounts, scopes, learner access, audit log
          path: "/admin",
          lazy: async () => ({ Component: (await import("./pages/staff/AdminPage")).AdminPage }),
        },

        {
          // staff-only coverage table: loaded on demand so patients never download it
          path: "/curriculum",
          lazy: async () => ({ Component: (await import("./pages/CurriculumPage")).CurriculumPage }),
        },
        {
          // staff: printable QR poster and handbook stickers, loaded on demand
          path: "/poster",
          lazy: async () => ({ Component: (await import("./pages/PosterPage")).PosterPage }),
        },
        { path: "*", element: <HomePage /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, "") || "/" },
);

export default function App() {
  return <RouterProvider router={router} />;
}
