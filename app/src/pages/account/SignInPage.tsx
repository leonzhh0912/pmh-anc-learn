import { Link, Navigate, useNavigate } from "react-router";
import { OtpSignIn } from "../../account/OtpSignIn";
import { useSession } from "../../account/session";
import { AccountsOff } from "./AccountsOff";

export function SignInPage() {
  const session = useSession();
  const navigate = useNavigate();
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
        <OtpSignIn methods={["phone", "email"]} onSignedIn={() => navigate("/account", { replace: true })} />
      )}
    </main>
  );
}
