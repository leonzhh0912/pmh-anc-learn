import { Link, Navigate, useNavigate } from "react-router";
import { OtpSignIn } from "../../account/OtpSignIn";
import { PasswordSignIn } from "../../account/PasswordSignIn";
import { signinMethods } from "../../account/config";
import { useState } from "react";
import { useSession } from "../../account/session";
import { AccountsOff } from "./AccountsOff";

export function SignInPage() {
  const session = useSession();
  const navigate = useNavigate();
  const codeMethods = signinMethods.filter((m): m is "phone" | "email" => m !== "password");
  const [useCode, setUseCode] = useState(!signinMethods.includes("password"));
  if (session.phase === "disabled") return <AccountsOff />;
  if (session.phase === "signed-in") return <Navigate to={session.account.kind === "staff" ? "/staff" : "/account"} replace />;
  return (
    <main className="page signin">
      <Link to="/" className="lesson__back">
        ‹ หน้าแรก
      </Link>
      <h1>เข้าสู่ระบบเพื่อบันทึกการเรียน</h1>
      <p className="signin__why">
        ไม่ต้องเข้าสู่ระบบก็เรียนได้ทุกบท การเข้าสู่ระบบช่วยให้ความคืบหน้าบันทึกเข้าบัญชีของคุณ เปิดต่อจากมือถือเครื่องอื่นได้
        และเจ้าหน้าที่ที่ดูแลคุณเห็นว่าเรียนถึงไหนแล้ว
      </p>
      <p className="signin__tutorial">
        ไม่แน่ใจว่าต้องทำอย่างไร <Link to="/start">ดูวิธีใช้งาน (มีตัวอย่างให้ลองกด)</Link>
      </p>
      {session.phase === "loading" ? (
        <p role="status">กำลังโหลด…</p>
      ) : (
        <>
          {!useCode && <PasswordSignIn audience="learner" onSignedIn={() => navigate("/account", { replace: true })} />}
          {useCode && codeMethods.length > 0 && (
            <OtpSignIn methods={codeMethods} onSignedIn={() => navigate("/account", { replace: true })} />
          )}
          {signinMethods.includes("password") && codeMethods.length > 0 && (
            <p>
              <button type="button" className="linklike" onClick={() => setUseCode(!useCode)}>
                {useCode ? "เข้าด้วยรหัสผู้เรียนและรหัสผ่านจากโรงพยาบาล" : "เข้าด้วยรหัสทาง SMS หรืออีเมลแทน"}
              </button>
            </p>
          )}
          {signinMethods.includes("password") && (
            <p className="auth__hint">
              ยังไม่มีบัญชี ขอให้เจ้าหน้าที่ที่คลินิกสร้างบัญชีให้ จะได้รับใบที่มีรหัสผู้เรียนและรหัสผ่าน
            </p>
          )}
        </>
      )}
    </main>
  );
}
