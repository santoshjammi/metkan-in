#!/usr/bin/env bash
# Back up the MITT enquiry store.
#
# The lead store is the only irreplaceable state on this host: losing it loses
# commercial enquiries. Run this daily from cron and copy the archive off-box.
#
#   MITT_LEAD_DIR=/var/lib/mitt/enquiries BACKUP_DIR=/var/backups/mitt \
#     ./scripts/backup-leads.sh
#
# Exit codes: 0 ok (or nothing to back up), 1 failure.

set -euo pipefail

LEAD_DIR="${MITT_LEAD_DIR:-./var/enquiries}"
BACKUP_DIR="${BACKUP_DIR:-./var/backups}"
KEEP="${KEEP:-30}"

if [ ! -d "$LEAD_DIR" ]; then
  echo "backup: nothing to do, lead dir does not exist: $LEAD_DIR"
  exit 0
fi

if ! ls "$LEAD_DIR"/*.jsonl >/dev/null 2>&1; then
  echo "backup: nothing to do, no enquiry files in $LEAD_DIR"
  exit 0
fi

mkdir -p "$BACKUP_DIR"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
ARCHIVE="$BACKUP_DIR/enquiries-$STAMP.tar.gz"

# Archive, then verify the archive actually reads back before trusting it.
tar -czf "$ARCHIVE" -C "$(dirname "$LEAD_DIR")" "$(basename "$LEAD_DIR")"
tar -tzf "$ARCHIVE" >/dev/null

LINES=$(cat "$LEAD_DIR"/*.jsonl | wc -l | tr -d ' ')
SUM=$(shasum -a 256 "$ARCHIVE" 2>/dev/null | awk '{print $1}' || sha256sum "$ARCHIVE" | awk '{print $1}')
printf '%s  records=%s  sha256=%s\n' "$ARCHIVE" "$LINES" "$SUM" | tee "$ARCHIVE.txt"

# Prune old archives, newest kept.
ls -1t "$BACKUP_DIR"/enquiries-*.tar.gz 2>/dev/null | tail -n +$((KEEP + 1)) | while read -r old; do
  rm -f "$old" "$old.txt"
done

echo "backup: ok"
