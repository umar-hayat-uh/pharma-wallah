#!/usr/bin/env bash
#
# Builds a release APK of the offline calculators app.
#
#   npm run mobile:apk
#
# Steps: regenerate the mobile routes -> static export -> copy into the native
# project -> Gradle release build. Fails early with an actionable message rather
# than halfway through a 3-minute Gradle run.
set -euo pipefail

cd "$(dirname "$0")/.."
REPO_ROOT="$(pwd)"

say()  { printf '\n\033[1;34m==>\033[0m %s\n' "$1"; }
fail() { printf '\n\033[1;31mERROR:\033[0m %s\n\n' "$1" >&2; exit 1; }

# ── Preflight ───────────────────────────────────────────────────────────────
#
# Capacitor 8 compiles with `sourceCompatibility JavaVersion.VERSION_21`, so a
# JDK older than 21 fails — but only ~15 minutes in, at
# `:capacitor-android:compileReleaseJavaWithJavac`, with the cryptic
# "invalid source release: 21". Check the actual version up front, and pick a
# newer JDK automatically if one is installed but is not the system default.
REQUIRED_JAVA=21

java_major() {
  # "openjdk version \"21.0.4\" ..." -> 21   |   "1.8.0_412" -> 8
  "$1" -version 2>&1 | awk -F'"' '/version/ {split($2, v, /[._]/); print (v[1] == 1 ? v[2] : v[1]); exit}'
}

JAVA_BIN=""

# 1. An explicit JAVA_HOME wins, if it is new enough.
if [ -n "${JAVA_HOME:-}" ] && [ -x "$JAVA_HOME/bin/java" ]; then
  if [ "$(java_major "$JAVA_HOME/bin/java")" -ge "$REQUIRED_JAVA" ] 2>/dev/null; then
    JAVA_BIN="$JAVA_HOME/bin/java"
  fi
fi

# 2. Otherwise the one on PATH.
if [ -z "$JAVA_BIN" ] && command -v java >/dev/null 2>&1; then
  if [ "$(java_major java)" -ge "$REQUIRED_JAVA" ] 2>/dev/null; then
    JAVA_BIN="$(command -v java)"
    unset JAVA_HOME
  fi
fi

# 3. Otherwise go looking for an installed-but-not-default JDK.
if [ -z "$JAVA_BIN" ]; then
  for candidate in /usr/lib/jvm/*/bin/java /Library/Java/JavaVirtualMachines/*/Contents/Home/bin/java; do
    [ -x "$candidate" ] || continue
    if [ "$(java_major "$candidate")" -ge "$REQUIRED_JAVA" ] 2>/dev/null; then
      JAVA_BIN="$candidate"
      export JAVA_HOME="${candidate%/bin/java}"
      say "Using JDK at $JAVA_HOME (the default java is older than $REQUIRED_JAVA)"
      break
    fi
  done
fi

if [ -z "$JAVA_BIN" ]; then
  CURRENT="none"
  command -v java >/dev/null 2>&1 && CURRENT="$(java_major java)"
  fail "Capacitor $(node -p "require('./node_modules/@capacitor/android/package.json').version" 2>/dev/null || echo 8) needs JDK $REQUIRED_JAVA or newer. Found: $CURRENT.

  sudo apt install openjdk-${REQUIRED_JAVA}-jdk

Gradle does not have to be told which one to use — this script finds it. You can
keep JDK 17 installed as your system default; nothing else here depends on it.

(The Android SDK itself is already present at ~/Android/Sdk.)"
fi

if [ -z "${ANDROID_HOME:-}" ] && [ -z "${ANDROID_SDK_ROOT:-}" ]; then
  if [ -d "$HOME/Android/Sdk" ]; then
    export ANDROID_HOME="$HOME/Android/Sdk"
    say "ANDROID_HOME not set — defaulting to $ANDROID_HOME"
  else
    fail "ANDROID_HOME is not set and ~/Android/Sdk does not exist. Install the Android SDK."
  fi
fi

# A keystore.properties still holding template values fails at
# :app:validateSigningRelease — roughly seven minutes into the Gradle run.
# Catch it here instead.
KS_PROPS="$REPO_ROOT/android/keystore.properties"
if [ -f "$KS_PROPS" ]; then
  ks_value() { sed -n "s/^$1=//p" "$KS_PROPS" | head -1; }
  KS_FILE="$(ks_value storeFile)"
  KS_PASS="$(ks_value storePassword)"
  KEY_PASS="$(ks_value keyPassword)"

  case "$KS_FILE" in
    /absolute/path/to/*|"") fail "android/keystore.properties still has the template storeFile.
Set it to the real path of your .jks, e.g.  storeFile=$HOME/pharmawallah-release.jks" ;;
  esac

  [ -f "$KS_FILE" ] || fail "Keystore not found: $KS_FILE
Either fix storeFile in android/keystore.properties, or create the key:

  keytool -genkey -v -keystore \"$KS_FILE\" -keyalg RSA -keysize 2048 -validity 10000 -alias pharmawallah"

  if [ "$KS_PASS" = "CHANGE_ME" ] || [ -z "$KS_PASS" ] || [ "$KEY_PASS" = "CHANGE_ME" ] || [ -z "$KEY_PASS" ]; then
    fail "android/keystore.properties still has CHANGE_ME passwords.
Put in the password you chose when you created $KS_FILE:

  sed -i 's/^storePassword=.*/storePassword=YOUR_PASSWORD/; s/^keyPassword=.*/keyPassword=YOUR_PASSWORD/' android/keystore.properties

(If you used different store and key passwords, set the two lines separately.)"
  fi

  # Cheapest possible proof the password is right — otherwise Gradle discovers
  # it late, after compiling everything.
  if ! keytool -list -keystore "$KS_FILE" -storepass "$KS_PASS" >/dev/null 2>&1; then
    fail "The storePassword in android/keystore.properties does not open $KS_FILE.
Check it against the password you set when creating the key."
  fi
  say "Signing key verified: $KS_FILE"
fi

[ -f "$KS_PROPS" ] || [ -n "${PW_KEYSTORE_FILE:-}" ] || cat <<'WARN'

⚠  No signing key configured.

   Gradle will still produce an APK, but it will be UNSIGNED and no phone will
   install it. To sign:

     cp android/keystore.properties.example android/keystore.properties
     # then create the key and fill the file in — see mobile/README.md

WARN

# Android resource XML is parsed by Gradle only at :app:mergeReleaseResources,
# which runs AFTER the whole web build and sync — so a stray malformed file
# costs minutes to discover. Validate it here in milliseconds. (The classic
# offender: "--" inside an XML comment, which XML forbids outright.)
say "Validating Android resource XML"
python3 - <<'PYEOF' || fail "Fix the XML above, then re-run."
import glob, sys, xml.dom.minidom
bad = []
for f in sorted(glob.glob("android/app/src/main/res/**/*.xml", recursive=True)) + ["android/app/src/main/AndroidManifest.xml"]:
    try:
        xml.dom.minidom.parse(f)
    except Exception as e:
        bad.append(f"{f}: {e}")
for b in bad:
    print(f"  INVALID {b}")
sys.exit(1 if bad else 0)
PYEOF

# ── Build ───────────────────────────────────────────────────────────────────
say "Building the static calculator bundle"
npm run mobile:build

say "Copying it into the native Android project"
npx cap sync android

say "Gradle release build (this takes a few minutes the first time)"
cd "$REPO_ROOT/android"
./gradlew assembleRelease

APK="$REPO_ROOT/android/app/build/outputs/apk/release/app-release.apk"
UNSIGNED="$REPO_ROOT/android/app/build/outputs/apk/release/app-release-unsigned.apk"

if [ -f "$APK" ]; then
  # The site serves the APK from its own /public directory, so publishing is
  # just a copy — done here rather than by hand, because a stale APK next to a
  # fresh /download page is a silent and embarrassing failure.
  PUBLISHED="$REPO_ROOT/public/downloads/pharmawallah-calculators.apk"
  mkdir -p "$(dirname "$PUBLISHED")"
  cp "$APK" "$PUBLISHED"

  say "Signed APK ready"
  printf '   built:     %s  (%s)\n' "$APK" "$(du -h "$APK" | cut -f1)"
  printf '   published: public/downloads/pharmawallah-calculators.apk\n\n'
  printf '   It ships with the site. Commit it and deploy:\n'
  printf '     git add public/downloads/pharmawallah-calculators.apk\n'
  printf '     git commit -m "Release APK <version>" && git push\n\n'
  printf '   Remember to bump versionCode/versionName in android/app/build.gradle\n'
  printf '   and APP_VERSION in src/app/(site)/download/DownloadClient.tsx.\n\n'
elif [ -f "$UNSIGNED" ]; then
  fail "Built, but UNSIGNED: $UNSIGNED
Phones will refuse to install it. Configure android/keystore.properties and re-run."
else
  fail "Gradle finished but no APK was found under android/app/build/outputs/apk/release/."
fi
