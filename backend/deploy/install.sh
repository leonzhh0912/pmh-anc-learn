#!/bin/sh
# One-command setup of the ANC Learn accounts server inside Phimai Hospital (Ubuntu Server 24.04).
#
#   git clone -b feat/accounts-progress https://github.com/phimai-hospital/phimai-hospital.github.io.git pmh-anc
#   cd pmh-anc/backend/deploy
#   sudo sh install.sh --domain ancapi.<hospital domain> --admin-email admin@<hospital domain> \
#        --admin-name "ชื่อผู้ดูแลระบบ" --backup-dir /mnt/backup/pmh-anc
#
# What it does (safe to run again; it never regenerates existing secrets or a second first-admin):
#   1. installs Docker, Caddy (HTTPS) and tools        5. HTTPS front door: only /auth/v1, /rest/v1, /functions/v1
#   2. Supabase self-hosted, pinned release             6. our database tables, rules and functions (migrations)
#   3. secrets + settings (no public sign-up, no SMS)   7. first administrator (password shown ONCE)
#   4. internal ports kept on this machine only         8. nightly backups (cron)
# Everything starts by itself after a reboot. Secrets stay in /opt/supabase-project/.env (root only).
#
# Options: --tls-internal  use a self-signed certificate (rehearsal without a public name; phones will warn)
#          --skip-upgrade  don't run apt upgrade (faster rehearsals)
set -eu

SUPABASE_REF="self-hosted/v0.8.4"
PROJECT=/opt/supabase-project
HERE=$(cd "$(dirname "$0")" && pwd)
REPO=$(cd "$HERE/../.." && pwd)
DOMAIN="" ADMIN_EMAIL="" ADMIN_NAME="" BACKUP_DIR="/var/backups/pmh-anc" TLS_INTERNAL=0 SKIP_UPGRADE=0

while [ $# -gt 0 ]; do
  case "$1" in
    --domain) DOMAIN="$2"; shift 2 ;;
    --admin-email) ADMIN_EMAIL="$2"; shift 2 ;;
    --admin-name) ADMIN_NAME="$2"; shift 2 ;;
    --backup-dir) BACKUP_DIR="$2"; shift 2 ;;
    --tls-internal) TLS_INTERNAL=1; shift ;;
    --skip-upgrade) SKIP_UPGRADE=1; shift ;;
    *) echo "unknown option: $1"; exit 2 ;;
  esac
done

say() { printf '\n\033[1m==> %s\033[0m\n' "$*"; }
die() { printf '\n\033[31mSTOPPED: %s\033[0m\n' "$*"; exit 1; }

[ "$(id -u)" = 0 ] || die "run with sudo: sudo sh install.sh ..."
[ -n "$DOMAIN" ] && [ -n "$ADMIN_EMAIL" ] && [ -n "$ADMIN_NAME" ] || die "--domain, --admin-email and --admin-name are required"
. /etc/os-release
[ "$ID" = ubuntu ] || die "this installer is for Ubuntu Server 24.04 (found $PRETTY_NAME)"
[ -d "$REPO/backend/supabase/migrations" ] || die "run it from the project checkout (backend/deploy)"

say "1/8 System packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -q
[ "$SKIP_UPGRADE" = 1 ] || apt-get -y -q upgrade
apt-get install -y -q ca-certificates curl git gnupg openssl postgresql-client unattended-upgrades debian-keyring debian-archive-keyring apt-transport-https
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker >/dev/null
if ! command -v caddy >/dev/null 2>&1; then
  curl -1sLf https://dl.cloudsmith.io/public/caddy/stable/gpg.key | gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -q && apt-get install -y -q caddy
fi
timedatectl set-timezone Asia/Bangkok 2>/dev/null || true

say "2/8 Supabase ($SUPABASE_REF)"
if [ ! -f "$PROJECT/docker-compose.yml" ]; then
  tmp=$(mktemp -d)
  git clone -q --depth 1 --branch "$SUPABASE_REF" https://github.com/supabase/supabase "$tmp/supabase"
  mkdir -p "$PROJECT" && cp -rf "$tmp/supabase/docker/." "$PROJECT/" && rm -rf "$tmp"
fi
cp "$HERE/docker-compose.override.yml" "$PROJECT/docker-compose.override.yml"

say "3/8 Secrets and settings"
cd "$PROJECT"
if [ ! -f .env ]; then
  cp .env.example .env
  sh utils/generate-keys.sh --update-env >/dev/null
  sh utils/add-new-auth-keys.sh --update-env >/dev/null
  echo "new secrets generated in $PROJECT/.env"
else
  echo "keeping existing secrets in $PROJECT/.env"
fi
chmod 600 .env
setenv() { # KEY VALUE: replace the line, or add it
  if grep -q "^$1=" .env; then
    esc=$(printf '%s' "$2" | sed -e 's/[\/&|]/\\&/g')
    sed -i "s|^$1=.*|$1=$esc|" .env
  else
    printf '%s=%s\n' "$1" "$2" >> .env
  fi
}
setenv SUPABASE_PUBLIC_URL "https://$DOMAIN"
setenv API_EXTERNAL_URL "https://$DOMAIN/auth/v1"
setenv SITE_URL "https://phimai-hospital.github.io"
setenv ADDITIONAL_REDIRECT_URLS "https://phimai-hospital.github.io"
setenv DISABLE_SIGNUP true
setenv ENABLE_EMAIL_SIGNUP true
setenv ENABLE_EMAIL_AUTOCONFIRM false
setenv ENABLE_PHONE_SIGNUP false
setenv ENABLE_ANONYMOUS_USERS false
if grep -q '^DASHBOARD_PASSWORD=this_password_is_insecure' .env; then
  setenv DASHBOARD_USERNAME pmh-it
  setenv DASHBOARD_PASSWORD "pmh-$(openssl rand -hex 16)"
fi

say "4/8 Starting (internal ports on this machine only)"
docker compose up -d --wait --wait-timeout 600 || die "some services did not become healthy: cd $PROJECT && docker compose ps"
docker compose ps --format 'table {{.Name}}\t{{.Status}}'
if ss -tlnp | grep -E ':(8000|5432|6543) ' | grep -vq '127.0.0.1'; then
  die "an internal port is open to the network (ss -tlnp); check docker-compose.override.yml"
fi
for i in $(seq 1 60); do curl -fsS http://127.0.0.1:8000/auth/v1/health >/dev/null 2>&1 && break; sleep 2; done
curl -fsS http://127.0.0.1:8000/auth/v1/health >/dev/null || die "sign-in service not answering on 127.0.0.1:8000"

say "5/8 HTTPS front door for $DOMAIN"
sed "s/ancapi.example.go.th/$DOMAIN/" "$HERE/Caddyfile.example" > /etc/caddy/Caddyfile
if [ "$TLS_INTERNAL" = 1 ]; then
  sed -i "s|^\tencode gzip|\ttls internal\n\tencode gzip|" /etc/caddy/Caddyfile
fi
caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile >/dev/null
systemctl enable caddy >/dev/null && systemctl reload caddy || systemctl restart caddy

say "6/8 Database: our tables, rules and functions"
psqlx() { docker exec -i supabase-db psql -v ON_ERROR_STOP=1 -U postgres -d postgres -q "$@"; }
psqlx -c "create schema if not exists ops; create table if not exists ops.applied_migrations (name text primary key, applied_at timestamptz not null default now()); revoke all on schema ops from public;"
for f in $(ls "$REPO"/backend/supabase/migrations/*.sql | sort); do
  name=$(basename "$f")
  done_already=$(psqlx -tAc "select 1 from ops.applied_migrations where name = '$name'")
  if [ "$done_already" = 1 ]; then echo "  already applied: $name"; continue; fi
  psqlx < "$f" || die "migration failed: $name"
  psqlx -c "insert into ops.applied_migrations (name) values ('$name')"
  echo "  applied: $name"
done

say "7/8 First administrator"
admins=$(psqlx -tAc "select count(*) from public.staff_members where role = 'admin'")
if [ "$admins" = 0 ]; then
  pw=$(psqlx -tAc "select private.bootstrap_admin_password('$(printf %s "$ADMIN_EMAIL" | sed "s/'/''/g")', '$(printf %s "$ADMIN_NAME" | sed "s/'/''/g")')")
  printf '\n\033[1;33m  FIRST ADMINISTRATOR (write this down now; it is not shown again):\n    email:    %s\n    password: %s\033[0m\n' "$ADMIN_EMAIL" "$pw"
else
  echo "  an administrator already exists; none created"
fi

say "8/8 Nightly backups -> $BACKUP_DIR"
install -m 700 "$HERE/backup.sh" /usr/local/sbin/pmh-anc-backup
mkdir -p "$BACKUP_DIR" && chmod 700 "$BACKUP_DIR"
cat > /etc/cron.d/pmh-anc-backup <<EOF
# ANC Learn: nightly database backup at 02:15 (Bangkok)
15 2 * * * root BACKUP_DIR=$BACKUP_DIR PROJECT=$PROJECT /usr/local/sbin/pmh-anc-backup >> /var/log/pmh-anc-backup.log 2>&1
EOF
BACKUP_DIR="$BACKUP_DIR" PROJECT="$PROJECT" /usr/local/sbin/pmh-anc-backup

publishable=$(grep '^SUPABASE_PUBLISHABLE_KEY=' .env | cut -d= -f2-)
say "DONE"
cat <<EOF
  Server:            https://$DOMAIN   (sign-in service: https://$DOMAIN/auth/v1/health)
  Secrets:           $PROJECT/.env  (root only; IT keeps a copy in the password manager)
  For the app:       VITE_SUPABASE_URL=https://$DOMAIN
                     VITE_SUPABASE_PUBLISHABLE_KEY=$publishable   (public by design)
  Status any time:   cd $PROJECT && sudo docker compose ps
  Backup log:        /var/log/pmh-anc-backup.log
EOF
