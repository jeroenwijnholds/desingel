#!/usr/bin/env bash
# Eenmalige setup na een verse clone (macOS). Veilig om opnieuw te draaien.
#   npm run setup            # alles, incl. build + tests
#   SKIP_VERIFY=1 npm run setup
set -euo pipefail
cd "$(dirname "$0")/.."

stap() { printf '\n\033[1;32m▸ %s\033[0m\n' "$1"; }
let_op() { printf '\033[1;33m! %s\033[0m\n' "$1"; TODO+=("$1"); }
TODO=()

stap "Node controleren (.nvmrc = $(cat .nvmrc))"
if command -v fnm >/dev/null; then
  eval "$(fnm env)"
  fnm use --install-if-missing >/dev/null 2>&1 || true
fi
if ! command -v node >/dev/null; then
  echo "Node ontbreekt. Installeer: brew install fnm && fnm install $(cat .nvmrc)"; exit 1
fi
NODE_MAJOR=$(node -p 'process.versions.node.split(".")[0]')
if (( NODE_MAJOR < 22 )); then
  echo "Node $(node -v) is te oud (≥ 22 nodig). brew install fnm && fnm install 22"; exit 1
fi
echo "Node $(node -v), npm $(npm -v)"

stap "Dependencies (npm ci, root + studio)"
npm ci
(cd studio && npm ci)

stap "Nuxt voorbereiden"
npx nuxt prepare

stap "Env-bestanden"
for f in .env studio/.env; do
  if [[ ! -f $f ]]; then
    cp "$f.example" "$f"
    let_op "$f aangemaakt uit $f.example — vul de echte waarden in"
  fi
done
grep -qE '^SANITY_PROJECT_ID=.+' .env || let_op "SANITY_PROJECT_ID ontbreekt in .env (build faalt zonder)"
grep -q 'xxxxxxxx' studio/.env && let_op "Umami-deellink in studio/.env is nog een placeholder (nodig vóór Studio-deploy)"

stap "Playwright-browser (viewport-check)"
npx playwright install chromium

stap "Logins"
if gh auth status >/dev/null 2>&1; then echo "GitHub: ingelogd"
else let_op "GitHub: niet ingelogd → gh auth login"; fi
if (cd studio && npx sanity debug 2>/dev/null | grep -q 'Not logged in'); then
  let_op "Sanity: niet ingelogd → cd studio && npx sanity login"
else echo "Sanity: ingelogd"; fi

if [[ -z ${SKIP_VERIFY:-} ]]; then
  stap "Verifiëren (tests + build)"
  npm test
  npm run build
fi

stap "Klaar"
if (( ${#TODO[@]} )); then
  echo "Nog zelf doen:"; printf '  - %s\n' "${TODO[@]}"
else
  echo "Alles staat klaar."
fi
