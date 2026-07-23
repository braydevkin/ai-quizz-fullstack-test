#!/usr/bin/env bash
#
# Sets the version on the root manifest and on every workspace manifest, so the
# whole monorepo carries one version.
#
# `npm pkg set` would do this in one line, but it also re-sorts dependency keys
# on the way out — a release commit has no business touching those. Rewriting
# the parsed JSON keeps key order (and therefore the diff) down to the one line
# that actually changed.
#
# Usage: .github/scripts/set-version.sh <version>

set -euo pipefail

cd "$(dirname "$0")/../.."

version=${1:?usage: set-version.sh <version>}

for manifest in package.json apps/*/package.json packages/*/package.json; do
  [[ -f $manifest ]] || continue

  node -e '
    const fs = require("node:fs")
    const [file, version] = process.argv.slice(1)
    const manifest = JSON.parse(fs.readFileSync(file, "utf8"))

    manifest.version = version
    fs.writeFileSync(file, JSON.stringify(manifest, null, 2) + "\n")
  ' "$manifest" "$version"

  echo "$manifest -> $version"
done
