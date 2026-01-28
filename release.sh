#!/usr/bin/env bash
set -e

# ---------------- LOAD ENV ----------------
if [ -f ".env" ]; then
  echo "📦 Loading environment variables from .env file..."
  export $(grep -v '^#' .env | xargs)
else
  echo "⚠️  Warning: .env file not found. Create one from .env.example"
  echo "   Checking environment variables..."
fi

# ---------------- CONFIG ----------------
PUBLISHER="sk2you"
EXTENSION_NAME="smart-size-explorer"
DATE=$(date +"%Y-%m-%d")

# ---------------- CHECKS ----------------
if ! command -v jq >/dev/null; then
  echo "❌ jq is required (brew install jq / apt install jq)"
  exit 1
fi

if [ -z "$VSCE_PAT" ]; then
  echo "❌ VSCE_PAT environment variable not set (VS Code Marketplace token)"
  exit 1
fi

if [ -z "$OVSX_PAT" ]; then
  echo "❌ OVSX_PAT environment variable not set (Open VSX token)"
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "❌ Git working tree not clean"
  exit 1
fi

# ---------------- VERSION BUMP ----------------
CURRENT_VERSION=$(jq -r '.version' package.json)
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"
NEW_VERSION="$MAJOR.$MINOR.$((PATCH + 1))"

echo "🔼 Version: $CURRENT_VERSION → $NEW_VERSION"

jq ".version = \"$NEW_VERSION\"" package.json > package.tmp.json
mv package.tmp.json package.json

# ---------------- CHANGELOG UPDATE ----------------
echo "📝 Updating CHANGELOG.md"

awk -v ver="$NEW_VERSION" -v date="$DATE" '
BEGIN { replaced=0 }
/^## \[Unreleased\]/ {
  print "## [" ver "] - " date
  replaced=1
  next
}
{ print }
END {
  if (!replaced) {
    print "❌ ERROR: [Unreleased] section not found in CHANGELOG.md" > "/dev/stderr"
    exit 1
  }
}
' CHANGELOG.md > CHANGELOG.tmp.md

mv CHANGELOG.tmp.md CHANGELOG.md

# ---------------- BUILD ----------------
npm run build

# ---------------- COMMIT & TAG ----------------
git add package.json CHANGELOG.md
git commit -m "release: v$NEW_VERSION"
git tag "v$NEW_VERSION"
git push origin main --tags
# ---------------- PUBLISH ----------------
echo "🚀 Publishing to VS Code Marketplace"
vsce publish --pat "$VSCE_PAT"

echo "🚀 Publishing to Open VSX"
ovsx publish -p "$OVSX_PAT"

echo "✅ Released v$NEW_VERSION successfully"
