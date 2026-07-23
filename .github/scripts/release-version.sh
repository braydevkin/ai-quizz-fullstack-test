#!/usr/bin/env bash
#
# Derives the version to release from the Conventional Commits added since the
# last `v*` tag, and prints `key=value` lines meant to be appended to
# $GITHUB_OUTPUT:
#
#   previous_tag  tag the range starts at — empty on the very first release
#   range         git revision range holding the commits being released
#   version       version to release, without the leading `v`
#   tag           `v` + version
#   bump          initial | major | minor | patch | none
#   has_changes   `true` when there is anything to release
#
# Bump rules: a breaking change bumps major, a `feat` bumps minor, anything
# else bumps patch — so every merge into `main` produces a release, even a
# docs-only one. While the version is still 0.x a breaking change bumps minor
# instead, the usual SemVer pre-1.0 exception. The first release publishes the
# version the manifest already declares rather than bumping it.
#
# Usage: .github/scripts/release-version.sh >> "$GITHUB_OUTPUT"

set -euo pipefail

cd "$(dirname "$0")/../.."

manifest_version=$(node -p "require('./package.json').version")
# Sorted by version rather than by date: a tag pushed out of order must not
# become the baseline.
previous_tag=$(git tag --list 'v*' --sort=-v:refname | head -n 1)

emit() {
  printf 'previous_tag=%s\n' "$previous_tag"
  printf 'range=%s\n' "$1"
  printf 'version=%s\n' "$2"
  printf 'tag=v%s\n' "$2"
  printf 'bump=%s\n' "$3"
  printf 'has_changes=%s\n' "$4"
}

if [[ -z $previous_tag ]]; then
  emit 'HEAD' "$manifest_version" 'initial' 'true'
  exit 0
fi

range="$previous_tag..HEAD"
commits=$(git log --no-merges --format='%H' "$range")

if [[ -z $commits ]]; then
  emit "$range" "$manifest_version" 'none' 'false'
  exit 0
fi

bump='patch'

while read -r sha; do
  [[ -z $sha ]] && continue

  subject=$(git log -1 --format='%s' "$sha")
  body=$(git log -1 --format='%b' "$sha")

  type=''
  breaking='false'

  # type(scope)!: description
  if [[ $subject =~ ^([a-zA-Z]+)(\(([^\)]*)\))?(!)?: ]]; then
    type=$(printf '%s' "${BASH_REMATCH[1]}" | tr '[:upper:]' '[:lower:]')
    [[ -n ${BASH_REMATCH[4]} ]] && breaking='true'
  fi

  if grep -qiE '^BREAKING[ -]CHANGE:' <<<"$body"; then
    breaking='true'
  fi

  if [[ $breaking == 'true' ]]; then
    bump='major'
    break
  fi

  if [[ $type == 'feat' && $bump == 'patch' ]]; then
    bump='minor'
  fi
done <<<"$commits"

# Baseline is whichever is higher: the last tag or the manifest. A manual bump
# in package.json can then still move the version forward, never backwards.
base=$(printf '%s\n%s\n' "${previous_tag#v}" "$manifest_version" | sort -V | tail -n 1)
IFS='.' read -r major minor patch <<<"$base"
# Drop any prerelease/build suffix (`1.2.3-rc.1` -> `3`).
patch=${patch%%[-+]*}

if [[ $bump == 'major' && $major -eq 0 ]]; then
  bump='minor'
fi

case $bump in
  major)
    major=$((major + 1))
    minor=0
    patch=0
    ;;
  minor)
    minor=$((minor + 1))
    patch=0
    ;;
  patch)
    patch=$((patch + 1))
    ;;
esac

emit "$range" "$major.$minor.$patch" "$bump" 'true'
