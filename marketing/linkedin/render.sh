#!/usr/bin/env bash
# Render a post's HTML to PNG at 1080x1350 (2x density => 2160x2700).
# Usage: marketing/linkedin/render.sh post-01 [post.html] [out.png]
set -euo pipefail
dir="$(cd "$(dirname "$0")" && pwd)/$1"
src="${2:-post.html}"; out="${3:-${src%.html}.png}"
google-chrome --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=2 \
  --window-size=1080,1350 --virtual-time-budget=4000 --allow-file-access-from-files \
  --screenshot="$dir/$out" "file://$dir/$src" 2>/dev/null
echo "$dir/$out"
