#!/bin/sh
# Nightly database backup for self-hosted Supabase (run from cron as the server's admin user).
#   15 2 * * *  /home/ubuntu/backup.sh >> /home/ubuntu/backup.log 2>&1
# Keeps 14 daily dumps on the server; copy them off the server too (BACKUP_REMOTE, e.g. object storage in
# Thailand). Test a restore regularly (docs/THAI-CLOUD-SETUP.md, part 11).
set -eu
DIR=/home/ubuntu/backups
mkdir -p "$DIR"
STAMP=$(date +%Y-%m-%d)
docker exec supabase-db pg_dumpall -h localhost -U supabase_admin | gzip > "$DIR/pmh-anc-$STAMP.sql.gz"
# the encryption root key: without it, encrypted secrets in a restore are unreadable. Keep it safe.
cp -n /home/ubuntu/supabase-project/volumes/db/data/pgsodium_root.key "$DIR/pgsodium_root.key" 2>/dev/null || true
find "$DIR" -name 'pmh-anc-*.sql.gz' -mtime +14 -delete
if [ -n "${BACKUP_REMOTE:-}" ]; then
  # e.g. rclone copy "$DIR" "$BACKUP_REMOTE"   (set up rclone for your provider's object storage)
  rclone copy "$DIR" "$BACKUP_REMOTE"
fi
echo "$(date -Iseconds) backup ok: $DIR/pmh-anc-$STAMP.sql.gz"
