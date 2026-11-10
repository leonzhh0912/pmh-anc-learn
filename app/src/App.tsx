import { useEffect } from "react";
import { createBrowserRouter, Link, Outlet, RouterProvider } from "react-router";
import { AboutPage } from "./pages/AboutPage";
import { HomePage } from "./pages/HomePage";
import { LessonPage } from "./pages/LessonPage";
import { SectionPage } from "./pages/SectionPage";
import { setTextScale, useProgress } from "./lib/progress";
import "./App.css";

const scales = [
  { value: 1, label: "ขนาดตัวอักษรปกติ" },
  { value: 1.15, label: "ขนาดตัวอักษรใหญ่" },
  { value: 1.3, label: "ขนาดตัวอักษรใหญ่มาก" },
] as const;

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
        <Outlet />
      </div>
      <footer className="footer">
        <p>
          ต้นแบบเพื่อการทดสอบ เนื้อหาอ้างอิงสมุดบันทึกสุขภาพแม่และเด็ก ฉบับปรับปรุงใหม่ พ.ศ. 2568 กรมอนามัย
          ไม่ใช่เครื่องมือวินิจฉัยโรค
        </p>
        <Link to="/about">เกี่ยวกับแอปและข้อมูลของคุณ</Link>
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
        {
          // staff-only coverage table: loaded on demand so patients never download it
          path: "/curriculum",
          lazy: async () => ({ Component: (await import("./pages/CurriculumPage")).CurriculumPage }),
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
