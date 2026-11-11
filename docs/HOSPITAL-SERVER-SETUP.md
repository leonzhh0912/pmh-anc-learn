# Step-by-step: accounts on a server inside Phimai Hospital (no cloud)

**Decided 2026-11-11 (developer, for PMH):** the accounts database runs on a computer in the hospital, not in a
cloud. Patient data never leaves the hospital, and there is no monthly cloud bill.

- **Who does what:** you and PMH IT do the hands-on parts. Claude can't touch hospital hardware or networks; ask at
  any step and paste error messages (never passwords or keys).
- **Status:** parts 2–9 and 11 follow Supabase's official self-hosting setup and the templates in
  `backend/deploy/`. **Nobody has run them on the hospital's machine yet**, so expect small adjustments.
- **The app** stays at https://phimai-hospital.github.io, so the printed QR codes keep working. Only sign-in and
  progress go to the hospital server.

```
Patient's phone (anywhere) ──HTTPS──► https://ancapi.<hospital domain>
                                          │  hospital internet line + firewall (only port 443, and 80 for the certificate)
                                          ▼
                                  ANC server in the IT room (Ubuntu + Docker)
                                  Caddy (HTTPS) → Supabase: sign-in, database
                                          │
                                  nightly backup → external drive + a second copy kept elsewhere
```

## Which network option

| | **A. Reachable from the internet (recommended)** | B. Hospital Wi-Fi only |
|---|---|---|
| Patients' progress | saves from home, any time | saves only when the phone is on hospital Wi-Fi; kept on the phone until then |
| Staff see | up-to-date progress | progress as of each patient's last visit |
| What IT does | public address, a firewall rule for ports 443/80, a DNS name | internal DNS name, a certificate, Wi-Fi access |
| Catch | the server faces the internet, so updates matter (part 12) | Chrome asks patients for "local network" permission when the public app talks to an internal address ([Chrome: Local Network Access](https://developer.chrome.com/blog/local-network-access)). Avoiding that means serving the app from the hospital server too, which changes the QR address. **Not built or tested.** |

The rest of this guide is option **A**. If IT can't open a firewall port, tell Claude and we'll plan B properly.

## Part 1. Owners: never one person

Every account and the machine itself need **at least two PMH people**.
- **Passwords:** keep them in a password manager PMH controls.
- **GitHub organization `phimai-hospital`, adding an owner:**
  1. Go to https://github.com/orgs/phimai-hospital/people.
  2. **Invite member**, then enter their username or email.
  3. Choose **Owner**, then **Send invitation**.
  4. For an existing member instead: tick them, open the "selected" menu, **Change role** → **Owner**.
- **The server:** two people with SSH keys (part 3) and the server's `.env` in the password manager (part 5).
- **The app:** two administrators. The app refuses to remove the last one.

## Part 2. The computer

**Hardware** (a new mini PC or small server costs roughly ฿15,000–25,000; a spare one IT already has is fine if it
meets this):
- 4 CPU cores, **8–16 GB RAM**, a **256 GB+ SSD**, wired network (no Wi-Fi);
- an **external USB drive** (1 TB) for backups;
- a **UPS** (battery backup, about ฿3,000) so short power cuts don't corrupt the database.

**Where:** the locked IT room, plugged into the UPS, cabled to the hospital network. In the BIOS set
"power on after power loss" so it restarts by itself.

**Install Ubuntu Server 24.04 LTS** from a USB stick (ubuntu.com/download/server). During setup:
- turn on **OpenSSH server**;
- create the user `ubuntu`;
- choose "use an entire disk" and, if offered, encryption (LVM + LUKS). Then keep the disk password in the password
  manager, because someone must type it after every reboot.

Check: from another PC on the network, `ssh ubuntu@<server's LAN IP>` works.

## Part 3. Network (IT)

1. Give the server a **fixed LAN IP**, for example 10.x.x.50, by DHCP reservation.
2. **DNS:** `ancapi.<hospital domain>` (A record) → the hospital's **public IP**.
3. **Firewall / router:**
   - forward **TCP 443 and 80** from the public IP to the server's LAN IP;
   - nothing else from outside;
   - SSH (22) only from the IT network.
4. If the hospital's public IP changes now and then, IT needs a fixed IP from the internet provider or dynamic
   DNS.

Check (after part 6): from a phone on **mobile data** (not hospital Wi-Fi),
https://ancapi.<hospital domain>/auth/v1/health shows a padlock and some text.

## Part 4. Prepare the server

```bash
sudo apt update && sudo apt -y upgrade
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu && exit                # log in again afterwards
sudo apt -y install caddy postgresql-client unattended-upgrades ufw
sudo ufw allow 80,443/tcp && sudo ufw allow from <IT network, e.g. 10.0.0.0/8> to any port 22 && sudo ufw enable
sudo timedatectl set-timezone Asia/Bangkok
```

Add the second person's SSH public key to `~/.ssh/authorized_keys`.

Check: `docker run --rm hello-world` prints "Hello from Docker!".

## Part 5. Install Supabase

```bash
git clone --depth 1 https://github.com/supabase/supabase
cp -rf supabase/docker/. ~/supabase-project && cd ~/supabase-project
cp .env.example .env
sh utils/generate-keys.sh       # database password, JWT secret, keys, dashboard password
sh utils/add-new-auth-keys.sh   # publishable / secret keys
```

Edit `.env`:
- `SUPABASE_PUBLIC_URL` and `API_EXTERNAL_URL` = `https://ancapi.<hospital domain>`
- `SITE_URL=https://phimai-hospital.github.io`
- `DASHBOARD_USERNAME` / `DASHBOARD_PASSWORD`: long, with letters.
- SMTP: leave as it is; nothing is sent.

**Copy the whole `.env` into the password manager now.** It holds every server secret.

In `docker-compose.yml`, under the `auth:` service `environment:`, apply `backend/deploy/auth.env.example`:
- public sign-up off (only staff and admins create accounts);
- password sign-in on;
- SMS off;
- authenticator apps for staff.

Then start everything:

```bash
sh run.sh start             # = docker compose up -d --wait; services restart by themselves after a reboot
docker compose ps           # all "healthy"
```

## Part 6. HTTPS

```bash
sudo cp Caddyfile /etc/caddy/Caddyfile   # from backend/deploy/Caddyfile.example, with ancapi.<hospital domain>
sudo systemctl reload caddy
```

Caddy gets and renews a free Let's Encrypt certificate by itself; this needs port 80 forwarded (part 3).
- Ports 8000, 5432 and 3000 stay closed.
- Open Studio (the dashboard) only through a tunnel from an IT PC: `ssh -L 3000:localhost:3000 ubuntu@<server>`,
  then http://localhost:3000.

Check: the mobile-data check in part 3.

## Part 7. Our tables, rules and the first administrator

Apply the migrations **in filename order**. **Never** apply `backend/supabase/seed.sql`: it is for local
development only.

```bash
scp backend/supabase/migrations/*.sql ubuntu@<server>:~/migrations/        # from your computer
for f in $(ls ~/migrations/*.sql | sort); do                               # on the server
  docker exec -i supabase-db psql -v ON_ERROR_STOP=1 -U postgres -d postgres < "$f" || break
done
docker exec -it supabase-db psql -U postgres -d postgres \
  -c "select private.bootstrap_admin_password('admin@<hospital domain>', 'ชื่อผู้ดูแลระบบ');"
```

The last command prints a 10-digit password **once**; give it to that person on paper. They then:
1. open the app → วิธีใช้งานและช่วยเหลือ → สำหรับเจ้าหน้าที่;
2. sign in;
3. set up an authenticator app.

After that, administrators create everyone else in the app (docs/ACCOUNTS-ADMIN-GUIDE.md).

Check: `docker exec supabase-db psql -U postgres -c "select jobname from cron.job"` lists
`pmh-purge-expired-learners`, the daily 5-year clean-up.

## Part 8. Backups

Use `backend/deploy/backup.sh`. It writes a compressed dump to `~/backups` every night.
1. Mount the external drive at `/mnt/backup` (IT: add it to `/etc/fstab`).
2. Keep a **second copy somewhere else**: a second drive swapped weekly and kept in another building, or a hospital
   file server. A fire or theft in the IT room must not take the only copy.
3. Keep `pgsodium_root.key` with the backups and in the password manager.
4. Add it to cron with `crontab -e`:
   `15 2 * * * BACKUP_DIR=/mnt/backup/pmh-anc /home/ubuntu/backup.sh >> /home/ubuntu/backup.log 2>&1`
5. **Restore drill** before real patients, then every 3 months:
   1. Set up a spare PC as in parts 4–5.
   2. Restore with `gunzip -c pmh-anc-<date>.sql.gz | docker exec -i supabase-db psql -U supabase_admin -d postgres`.
   3. Sign in with a test account and check the progress is there.

Check: `~/backup.log` shows "backup ok" every morning.

## Part 9. Connect the app

Tell Claude when parts 2–8 pass. Claude will then:
1. Set the GitHub repository variables:
   - `VITE_SUPABASE_URL=https://ancapi.<hospital domain>`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: from `.env`; it is public by design, never the secret key
   - `VITE_SIGNIN_METHODS=password`
2. Adjust the publish workflow, merge the accounts branch after the tests pass, and check sign-in on the live site
   with you.

A private trial on a separate test address can come first.

## Part 10. Before real patients: checklist

- [ ] Two owners for GitHub, the server and the app (part 1)
- [ ] The server restarts by itself after a power cut (pull the plug once, with the UPS removed, as a test)
- [ ] The mobile-data HTTPS check works (part 3)
- [ ] An administrator creates a staff account; the staff member signs in with the slip and an authenticator app
- [ ] Staff create a test patient, print the slip, and the patient signs in on a real iPhone and Android phone
- [ ] Staff see only their group; "forgot password" gives a new slip and the old password stops working
- [ ] There is no way to create an account from the public sign-in page
- [ ] The backup restore drill passed

## Part 11. Looking after it

- **Monthly:** run `sudo apt update && sudo apt -y upgrade`, then reboot if asked. Security updates install
  automatically in between (unattended-upgrades).
- **About once a month:** check Supabase self-hosting release notes. Back up first, then `git pull` the docker
  folder and `sh run.sh start`.
- **Every morning:** glance at `~/backup.log`. The admin page tab "สถานะระบบ" (system status) shows when data last
  arrived.
- **If the server is down:** patients keep learning, and the app keeps their progress on the phone and sends it
  when the server is back. Staff pages need the server.
- **If anything looks wrong with access:** an administrator switches the staff account off instantly. Every staff
  action is in the activity log.
