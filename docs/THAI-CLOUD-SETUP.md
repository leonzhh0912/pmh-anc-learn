# Step-by-step: accounts on a Thai cloud server (for the developer and PMH IT)

You do the clicks and sign-ups; Claude can't create accounts or pay. Each part ends with a check, so you know it
worked before you go on. Prices and screens were checked on 2026-11-11 and can change.

**Status:** only parts 1–3 and 10 are ordinary sign-ups and settings. The server steps (4–9, 11) use Supabase's
official self-hosting setup and the templates in `backend/deploy/`, but **nobody has run them on a real server
yet**. Expect to adjust names to the provider's screens. Ask Claude at any step and paste the error (never paste
passwords or keys).

**What you will have at the end**

```
Patients' phones ──► https://phimai-hospital.github.io   (the app, same address and QR codes as today)
                         │ sign-in, progress (HTTPS)
                         ▼
                     https://api.<your domain>  ── Thai cloud server (Bangkok)
                         Caddy (HTTPS) → Supabase: Auth, database, SMS function
                         │                                     │
                         ▼                                     ▼
                     nightly backups                     ThaiBulkSMS → patient's phone
```

The app stays on GitHub Pages, so printed QR codes keep working and nothing about the address changes for
patients. Only the accounts server, where personal data lives, is in Thailand.

**Monthly cost, roughly**

| Item | Cost |
|---|---|
| Server, 2 vCPU / 8 GB / 80 GB | NIPA Cloud about ฿1,390, or AWS Bangkok t3.large about US$76 |
| SMS | ThaiBulkSMS Corporate about ฿0.48 per code (the ฿3,500 package is about 7,300 codes, valid 12 months), plus VAT |
| Email | Resend: free up to 3,000 emails/month |
| Domain | the hospital's own subdomain: free |

---

## Part 1. Owners: never one person (do this first)

Every account below needs **at least two owners from PMH**. Use a shared hospital mailbox (for example
`anc-learn@<hospital domain>`) for sign-ups, keep the passwords in a password manager PMH controls, and turn on
two-factor sign-in everywhere.

**GitHub organization `phimai-hospital`: add an owner**
1. Go to https://github.com/orgs/phimai-hospital/people.
2. If the person is not a member yet:
   1. **Invite member**.
   2. Type their GitHub username or email, then **Invite**.
   3. Under "Role in the organization" choose **Owner**, then **Send invitation**.
3. If the person is already a member:
   1. Tick their name.
   2. Open the "1 selected" menu and choose **Change role**.
   3. Pick **Owner**, then **Change role**.
4. Check: they appear with the role "Owner" once they accept.

**The other accounts**
- **Cloud provider (NIPA or AWS):** add a second administrator user.
  - AWS: IAM Identity Center user with AdministratorAccess.
  - Keep the root login on the shared mailbox with MFA, and don't use it day to day.
- **ThaiBulkSMS:** sign up with the shared mailbox; two people know the login.
- **Resend:** invite a second member to the team.
- **ElevenLabs:** the plan the videos use. Make sure PMH can reach that account, or plan a handover.
- **The app itself:** two administrators (part 8). The app refuses to remove the last one.
- **The server:** two people with SSH keys (part 5).

## Part 2. SMS for sign-in codes (ThaiBulkSMS)

1. Sign up at https://www.thaibulksms.com with the shared mailbox.
2. Buy the **฿3,500 package on the Corporate route**. Corporate gives credit back for undelivered messages, and the
   ฿3,500 package is the smallest that allows your own sender name.
3. **Sender name (ชื่อผู้ส่ง):** in the dashboard, request one of 4–10 English letters or digits, for example `PMHANC`
   or `PHIMAIHOSP`. Approval takes 5–7 working days. If they ask for documents (a name that looks like an
   organisation), use a letter from the hospital. Until it is approved you can only test with their `Demo` sender.
4. Create an **API key and API secret** in the dashboard. Store them in the password manager. Never put them in Git,
   chat or email.
5. Check: send yourself a test SMS from their dashboard.

*Cheaper alternative:* SMSMKT (฿1,000 minimum, about ฿0.60 per SMS, charges only delivered messages, sender
approval 2–3 days). The SMS function supports it: set `SMS_PROVIDER=smsmkt`.

## Part 3. Email sender (the fallback sign-in)

The simple choice is **Resend**.
1. Sign up at resend.com.
2. **Domains → Add domain:** use a subdomain such as `mail.<hospital domain>`.
3. Hospital IT adds the DNS records it shows (SPF/DKIM). Wait until they are verified.
4. **API Keys → Create:** this key is the SMTP password.
5. Settings for part 6:
   - host `smtp.resend.com`
   - port `587`
   - user `resend`
   - password: the API key
   - sender `no-reply@mail.<hospital domain>`, name `ANC Learn โรงพยาบาลพิมาย`

Any other SMTP service works the same way.

## Part 4. Create the server in Bangkok

Choose **one**:
- **NIPA Cloud** (Thai company, Thai support, THB invoices): a compute instance in **NCP-BKK**, about 2 vCPU /
  8 GB (asa.large.v2) and an 80 GB disk.
- **AWS:**
  1. In the account, enable the opt-in region **Asia Pacific (Thailand) ap-southeast-7**.
  2. EC2 → **Launch instance**: Ubuntu 24.04, **t3.large**, 80 GB **gp3**.
  3. Lightsail is not available in Thailand.

For either one:
1. **OS:** Ubuntu Server 24.04 LTS.
2. **Login:** create an SSH key pair and keep the private key safe. Password logins off.
3. **Firewall / security group:**
   - allow 22 (SSH) **only from your own IP**;
   - allow 80 and 443 from anywhere;
   - nothing else.
4. Give it a **fixed public IP** (AWS: Elastic IP).
5. **DNS:** ask hospital IT for an A record such as `api-anc.<hospital domain>` pointing to that IP.
   - To practise before that exists, use `<ip-with-dashes>.sslip.io` (for example `203-0-113-5.sslip.io`). It
     works with HTTPS automatically.

Check: `ssh ubuntu@<ip>` logs you in.

## Part 5. Prepare the server

```bash
sudo apt update && sudo apt -y upgrade
curl -fsSL https://get.docker.com | sudo sh          # Docker from docker.com
sudo usermod -aG docker ubuntu && exit               # log in again afterwards
sudo apt -y install caddy postgresql-client unattended-upgrades
```

Add the second person's SSH public key to `~/.ssh/authorized_keys`.

Check: `docker run --rm hello-world` prints "Hello from Docker!".

## Part 6. Install Supabase

```bash
git clone --depth 1 https://github.com/supabase/supabase
cp -rf supabase/docker/. ~/supabase-project && cd ~/supabase-project
cp .env.example .env
sh utils/generate-keys.sh          # writes the database password, JWT secret, keys, dashboard password into .env
sh utils/add-new-auth-keys.sh      # adds the publishable / secret keys
```

Then edit `.env` (`nano .env`):
- **Addresses:**
  - `SUPABASE_PUBLIC_URL=https://api-anc.<hospital domain>`
  - `API_EXTERNAL_URL=` the same address
  - `SITE_URL=https://phimai-hospital.github.io`
- **Email:**
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` from part 3
  - `SMTP_ADMIN_EMAIL`, `SMTP_SENDER_NAME`
- **Dashboard login:**
  - `DASHBOARD_USERNAME`: any name
  - `DASHBOARD_PASSWORD`: long, with letters
- Add a line `SEND_SMS_HOOK_SECRET=v1,whsec_<paste the output of: openssl rand -base64 32>`.
- **Copy all of `.env` into the password manager now.** It holds every server secret.

Open `docker-compose.yml`, find the `auth:` service and its `environment:` list. Add or uncomment the settings in
`backend/deploy/auth.env.example`. They cover:
- phone sign-in on;
- codes valid **600 s** (the default is only 60 s);
- 60 s resend cooldown;
- the SMS hook;
- email codes;
- authenticator apps for staff.

Then start everything:

```bash
sh run.sh start          # same as: docker compose up -d --wait
docker compose ps        # every service "healthy"
```

Check: `curl -s localhost:8000/auth/v1/health` returns JSON with a version.

## Part 7. HTTPS and closing doors

```bash
sudo cp Caddyfile /etc/caddy/Caddyfile     # start from backend/deploy/Caddyfile.example, put your address in
sudo systemctl reload caddy
```

- Only 80 and 443 should be reachable from outside. Ports 8000, 5432 and 3000 (Studio) stay closed in the
  firewall (part 4).
- Open Studio only through a tunnel: `ssh -L 3000:localhost:3000 ubuntu@<ip>`, then http://localhost:3000.

Check: from your own computer, `curl -s https://api-anc.<domain>/auth/v1/health` works and shows a padlock
(valid certificate).

## Part 8. The database: our tables, rules and first administrator

Copy the repository's migrations to the server and apply them **in filename order**. **Never** apply
`backend/supabase/seed.sql`: it is for local development only.

```bash
# on your computer
scp backend/supabase/migrations/*.sql ubuntu@<ip>:~/migrations/
# on the server (the password is POSTGRES_PASSWORD from .env)
for f in $(ls ~/migrations/*.sql | sort); do
  docker exec -i supabase-db psql -v ON_ERROR_STOP=1 -U postgres -d postgres < "$f" || break
done
```

Create the first administrator (a PMH person with a work email):

```bash
docker exec -it supabase-db psql -U postgres -d postgres \
  -c "select private.bootstrap_admin('admin@<hospital domain>', 'ชื่อผู้ดูแลระบบ');"
```

Check: `docker exec supabase-db psql -U postgres -c "select jobname, schedule from cron.job"` shows
`pmh-purge-expired-learners` (the daily 5-year clean-up).

## Part 9. The SMS function

```bash
# on your computer
scp -r backend/supabase/functions/send-sms ubuntu@<ip>:~/supabase-project/volumes/functions/
```

In `docker-compose.yml`, under the `functions:` service `environment:`, add the following (the values come from
part 2 and `.env`, never from Git):

```
SMS_PROVIDER: thaibulksms
THAIBULKSMS_API_KEY: ${THAIBULKSMS_API_KEY}
THAIBULKSMS_API_SECRET: ${THAIBULKSMS_API_SECRET}
SMS_SENDER: PMHANC
SEND_SMS_HOOK_SECRET: ${SEND_SMS_HOOK_SECRET}
```

Put `THAIBULKSMS_API_KEY=` and `THAIBULKSMS_API_SECRET=` lines in `.env`. Then:

```bash
sh run.sh recreate functions && sh run.sh recreate auth
```

Check:
1. Go to the test page (part 10).
2. Choose **เบอร์โทรศัพท์** (phone) and enter **your own** mobile number.
3. A Thai SMS from your sender name arrives within a minute, and the code signs you in.

If no SMS arrives, `docker compose logs functions auth | tail -50` shows why. The function never logs codes.

## Part 10. Connect the app (only after PMH approval)

This step makes sign-in visible to the public, so **don't do it until the privacy/IT approval is done**
(docs/ACCOUNTS-SCOPE.md). When you're ready, tell Claude and it will:
1. Add the repository variables `VITE_SUPABASE_URL` (your https API address) and `VITE_SUPABASE_PUBLISHABLE_KEY`
   (from `.env`; it is public by design, never the secret key) in GitHub → Settings → Secrets and variables →
   Actions → **Variables**.
2. Change the publish workflow to build with them.
3. Merge the accounts branch after the tests pass.
4. Run a check sign-in with your phone on the live site.

For a private trial first, Claude can build the accounts version to a separate test address, so the public site
doesn't change.

## Part 11. Backups and restore drill

```bash
cp backend/deploy/backup.sh ~/backup.sh && chmod +x ~/backup.sh   # (copy it to the server first)
crontab -e      # add:  15 2 * * *  /home/ubuntu/backup.sh >> /home/ubuntu/backup.log 2>&1
```

- **Off the server:** copy the backups to object storage in Thailand (NIPA Object Storage or AWS S3 in
  ap-southeast-7), for example with `rclone`.
- **Keep `pgsodium_root.key`** with the backups and in the password manager.
- **Restore drill**, before real patients and then every 3 months:
  1. Create a second small server.
  2. Install as in parts 5–6.
  3. Restore with `gunzip -c pmh-anc-<date>.sql.gz | docker exec -i supabase-db psql -U supabase_admin -d postgres`.
  4. Sign in as a test account and check that the progress is there.

Check: `~/backup.log` has a "backup ok" line every morning.

## Part 12. Before real patients: a checklist

- [ ] PMH privacy/IT approval, the privacy notice text, the deletion age, and research approval (ACCOUNTS-SCOPE.md)
- [ ] Two owners on every account (part 1)
- [ ] SMS works on at least 3 different networks (AIS, True, dtac) with consenting staff phones
- [ ] Staff sign-in with an authenticator app; a staff member sees only their group
- [ ] Deleting a test account works and appears in the activity log
- [ ] The backup restore drill passed
- [ ] A low SMS-credit alert in the ThaiBulkSMS dashboard

## Part 13. Looking after it

- Monthly: `sudo apt update && sudo apt -y upgrade`.
- About once a month, check Supabase self-hosting release notes before `git pull` and `sh run.sh start`.
  Back up first.
- Watch the SMS credit and `~/backup.log`.
- In the app, the admin page tab "สถานะระบบ" (system status) shows the last time data arrived.
- If anything looks wrong with access, an administrator can switch a staff account off instantly, and all staff
  actions are in the activity log.
