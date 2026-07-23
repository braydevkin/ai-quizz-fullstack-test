#!/usr/bin/env bash
#
# Renders Markdown release notes for a git revision range, grouping the
# Conventional Commits it contains by type. Output goes to stdout and is used
# both as the GitHub release body and as the new CHANGELOG.md section, so it
# stays Prettier-clean: one blank line between blocks, no trailing whitespace.
#
# Usage: .github/scripts/release-notes.sh <range> [previous-tag] [new-tag]

set -euo pipefail

range=${1:?usage: release-notes.sh <range> [previous-tag] [new-tag]}
previous_tag=${2:-}
new_tag=${3:-}

repository=${GITHUB_REPOSITORY:-}
server=${GITHUB_SERVER_URL:-https://github.com}

work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

# add <section> <line>
add() {
  printf '%s\n' "$2" >>"$work/$1"
}

while read -r sha; do
  [[ -z $sha ]] && continue

  subject=$(git log -1 --format='%s' "$sha")
  body=$(git log -1 --format='%b' "$sha")

  type=''
  scope=''
  breaking='false'
  description=$subject

  if [[ $subject =~ ^([a-zA-Z]+)(\(([^\)]*)\))?(!)?:[[:space:]]*(.*)$ ]]; then
    type=$(printf '%s' "${BASH_REMATCH[1]}" | tr '[:upper:]' '[:lower:]')
    scope=${BASH_REMATCH[3]}
    [[ -n ${BASH_REMATCH[4]} ]] && breaking='true'
    description=${BASH_REMATCH[5]}
  fi

  if [[ -n $repository ]]; then
    link=" ([\`${sha:0:7}\`](${server}/${repository}/commit/${sha}))"
  else
    link=" (\`${sha:0:7}\`)"
  fi

  entry="- ${scope:+**${scope}:** }${description}${link}"

  case $type in
    feat) add features "$entry" ;;
    fix) add fixes "$entry" ;;
    perf) add performance "$entry" ;;
    refactor) add refactoring "$entry" ;;
    docs) add documentation "$entry" ;;
    test) add tests "$entry" ;;
    build | ci) add build "$entry" ;;
    chore | style) add chores "$entry" ;;
    *) add other "$entry" ;;
  esac

  if [[ $breaking == 'true' ]] || grep -qiE '^BREAKING[ -]CHANGE:' <<<"$body"; then
    note=$(sed -nE 's/^BREAKING[ -]CHANGE:[[:space:]]*//Ip' <<<"$body" | head -n 1)
    add breaking "- ${scope:+**${scope}:** }${note:-$description}${link}"
  fi
done <<<"$(git log --no-merges --format='%H' "$range")"

# section <file> <title>
section() {
  [[ -f "$work/$1" ]] || return 0
  printf '### %s\n\n' "$2"
  cat "$work/$1"
  printf '\n'
}

if [[ -z $(ls -A "$work") ]]; then
  printf '_No changes._\n\n'
else
  section breaking 'Breaking changes'
  section features 'Features'
  section fixes 'Bug fixes'
  section performance 'Performance'
  section refactoring 'Refactoring'
  section documentation 'Documentation'
  section tests 'Tests'
  section build 'Build and CI'
  section chores 'Chores'
  section other 'Other changes'
fi

if [[ -n $repository && -n $previous_tag && -n $new_tag ]]; then
  printf '**Full changelog**: %s/%s/compare/%s...%s\n' \
    "$server" "$repository" "$previous_tag" "$new_tag"
fi
