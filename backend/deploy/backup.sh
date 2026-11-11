#!/bin/sh
# Nightly database backup for the ANC Learn server (installed by install.sh as /usr/local/sbin/pmh-anc-backup,
# run by /etc/cron.d/pmh-anc-backup as root).
#   BACKUP_DIR  where dumps go (an external drive or a share in another room), default /var/backups/pmh-anc
#   PROJECT     the Supabase folder, default /opt/supabase-project
# Keeps 14 daily dumps. Test a restore regularly (docs/HOSPITAL-SERVER-SETUP.md).
set -eu
DIR=${BACKUP_DIR:-/var/backups/pmh-anc}
PROJECT=${PROJECT:-/opt/supabase-project}
mkdir -p "$DIR" && chmod 700 "$DIR"
STAMP=$(date +%Y-%m-%d)
OUT="$DIR/pmh-anc-$STAMP.sql.gz"
docker exec supabase-db pg_dumpall -h localhost -U supabase_admin | gzip > "$OUT.part"
gzip -t "$OUT.part" && mv "$OUT.part" "$OUT"
chmod 600 "$OUT"
# the database encryption root key and the server secrets: needed to restore. Copied once, kept with the dumps.
[ -f "$DIR/pgsodium_root.key" ] || cp "$PROJECT/volumes/db/data/pgsodium_root.key" "$DIR/" 2>/dev/null || true
[ -f "$DIR/supabase.env" ] || install -m 600 "$PROJECT/.env" "$DIR/supabase.env"
find "$DIR" -name 'pmh-anc-*.sql.gz' -mtime +14 -delete
echo "$(date -Iseconds) backup ok: $OUT ($(du -h "$OUT" | cut -f1))"
