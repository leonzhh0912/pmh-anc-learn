# คำขอถึงฝ่ายไอที: เครื่องเซิร์ฟเวอร์สำหรับ ANC Learn

(ส่งข้อความนี้ให้ฝ่ายไอทีได้เลย ภาษาอังกฤษอยู่ด้านล่าง)

เรียน ฝ่ายไอที โรงพยาบาลพิมาย

โครงการ ANC Learn (บทเรียนคู่สมุดสีชมพู) ขอเครื่องเซิร์ฟเวอร์ 1 เครื่องในห้องเซิร์ฟเวอร์ของโรงพยาบาล
สำหรับเก็บบัญชีผู้เรียนและความคืบหน้าการเรียน (ข้อมูลอยู่ในโรงพยาบาล ไม่ใช้คลาวด์) ดังนี้

1. **เครื่อง:** Virtual Machine (ถ้ามีระบบ VM อยู่แล้ว) หรือเครื่องจริง ติดตั้ง **Ubuntu Server 24.04 LTS**
   - CPU 4 คอร์, RAM 8 GB, ดิสก์ 100 GB (SSD)
   - เปิด OpenSSH, มีผู้ใช้ที่ใช้ `sudo` ได้
   - ตั้งให้เปิดเครื่องเองหลังไฟดับ (ถ้าเป็นเครื่องจริง ต่อ UPS)
2. **IP ภายในแบบคงที่** 1 หมายเลข
3. **ชื่อโดเมน** `ancapi.<โดเมนของโรงพยาบาล>` ชี้ไปที่ IP สาธารณะของโรงพยาบาล
4. **ไฟร์วอลล์:** ส่งต่อพอร์ต **443 และ 80 (TCP)** จากอินเทอร์เน็ตมาที่เครื่องนี้เท่านั้น
   (80 ใช้ขอใบรับรอง HTTPS อัตโนมัติจาก Let's Encrypt) พอร์ตอื่นปิด
5. **SSH (พอร์ต 22)** จากเครือข่ายภายในเท่านั้น และเพิ่ม SSH public key ของผู้พัฒนา (จะส่งให้แยก)
6. **ที่เก็บสำรองข้อมูล:** ไดรฟ์ภายนอก หรือพื้นที่แชร์ในห้องอื่น (ประมาณ 50 GB)

เมื่อพร้อม ผู้พัฒนาจะรันคำสั่งติดตั้งชุดเดียว (`backend/deploy/install.sh`) ซึ่งติดตั้ง Docker, Caddy (HTTPS)
และ Supabase แบบติดตั้งเอง ตั้งค่าความปลอดภัย และสำรองข้อมูลทุกคืน
ระบบไม่ส่ง SMS หรืออีเมล และไม่เปิดให้สมัครสมาชิกเอง (เจ้าหน้าที่เป็นผู้สร้างบัญชี)

ขอบคุณครับ/ค่ะ

---

**English**

ANC Learn (patient education, pink handbook) needs one server in the hospital data center for learner accounts
and learning progress (data stays in the hospital, no cloud):

1. A VM (or physical machine) with **Ubuntu Server 24.04 LTS**: 4 vCPU, 8 GB RAM, 100 GB SSD, OpenSSH, a sudo
   user, auto power-on after power loss (UPS if physical).
2. One **fixed internal IP**.
3. DNS **`ancapi.<hospital domain>`** → the hospital's public IP.
4. Firewall: forward **TCP 443 and 80** from the internet to this machine only (80 is for the automatic Let's
   Encrypt certificate). Nothing else open.
5. **SSH (22)** from the internal network only, with the developer's SSH public key added (sent separately).
6. A **backup target**: an external drive or a share in another room (about 50 GB).

The developer then runs one installer (`backend/deploy/install.sh`). It sets up Docker, Caddy (HTTPS) and
self-hosted Supabase with the security settings, and nightly backups. No SMS or email is sent, and there is no
public sign-up (staff create accounts).
