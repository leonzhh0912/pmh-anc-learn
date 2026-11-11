#!/bin/sh
# Checks the ANC Learn accounts server from the outside, the way a patient's phone sees it. Needs only curl.
#
#   sh check-server.sh ancapi.<hospital domain> <publishable key>
#   (rehearsal only: CHECK_RESOLVE=127.0.0.1 CHECK_INSECURE=1 sh check-server.sh ancapi.rehearsal.test <key>)
#
# The publishable key is public by design (it is in the app). Never pass the secret key here.
set -u
HOST=${1:?usage: check-server.sh <name> <publishable key>}
KEY=${2:?usage: check-server.sh <name> <publishable key>}
APP_ORIGIN=https://phimai-hospital.github.io
BASE="https://$HOST"
CURL="curl -s --max-time 20"
[ -n "${CHECK_RESOLVE:-}" ] && CURL="$CURL --resolve $HOST:443:$CHECK_RESOLVE"
[ -n "${CHECK_INSECURE:-}" ] && CURL="$CURL -k"
pass=0 fail=0
ok() { pass=$((pass + 1)); printf '  \033[32mOK\033[0m   %s\n' "$1"; }
bad() { fail=$((fail + 1)); printf '  \033[31mFAIL\033[0m %s  (%s)\n' "$1" "$2"; }

echo "Checking $BASE"

code=$($CURL -o /dev/null -w '%{http_code}' -H "apikey: $KEY" "$BASE/auth/v1/health")
[ "$code" = 200 ] && ok "HTTPS works and the sign-in service answers" || bad "sign-in service over HTTPS" "HTTP $code"

if [ -z "${CHECK_INSECURE:-}" ]; then
  curl -s --max-time 20 ${CHECK_RESOLVE:+--resolve $HOST:443:$CHECK_RESOLVE} -o /dev/null "$BASE/auth/v1/health" \
    && ok "certificate is valid (phones will show a padlock)" || bad "certificate" "not trusted"
fi

allow=$($CURL -o /dev/null -D - -X OPTIONS -H "Origin: $APP_ORIGIN" -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: apikey,content-type,authorization" "$BASE/auth/v1/token?grant_type=password" \
  | tr -d '\r' | grep -i '^access-control-allow-origin:' | cut -d' ' -f2-)
case "$allow" in "$APP_ORIGIN"|"*") ok "the app's website may talk to the server (CORS)";; *) bad "CORS for $APP_ORIGIN" "got '${allow:-none}'";; esac

body=$($CURL -X POST -H "apikey: $KEY" -H 'content-type: application/json' \
  -d '{"email":"public-signup-check@example.invalid","password":"check-123456789"}' "$BASE/auth/v1/signup")
echo "$body" | grep -qi 'signups not allowed\|signup_disabled' && ok "public sign-up is off (only staff create accounts)" \
  || bad "public sign-up should be off" "$(echo "$body" | head -c 120)"

body=$($CURL -X POST -H "apikey: $KEY" -H 'content-type: application/json' -d '{}' "$BASE/rest/v1/rpc/my_account")
echo "$body" | grep -q '"kind"' && bad "functions need a signed-in user" "answered without sign-in" || ok "functions refuse callers who are not signed in"

body=$($CURL -H "apikey: $KEY" "$BASE/rest/v1/learners?select=*")
case "$body" in "[]"|*"permission denied"*|*"42501"*|*"PGRST"*) ok "no learner data without signing in";; *) bad "learner data must not be readable" "$(echo "$body" | head -c 120)";; esac

for p in / /project/default /pg/meta /analytics/v1; do
  code=$($CURL -o /dev/null -w '%{http_code}' "$BASE$p")
  [ "$code" = 404 ] && ok "not exposed: $p" || bad "should not be exposed: $p" "HTTP $code"
done

echo
echo "$pass passed, $fail failed"
[ "$fail" = 0 ]
