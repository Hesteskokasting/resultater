# Android release

Push a new native version to Google Play. The app loads the site live via `server.url`, so
**ordinary web changes need no new app version** — only native changes do (new Capacitor
plugin, `capacitor.config.ts`, icons/splash, `AndroidManifest.xml`, Gradle config).

Requires `android/app/keystore.properties` + the keystore file — see
[README → Release-signering](README.md#release-signering).

## Release

```powershell
# 1. Deploy web to production FIRST (see git-prod-release.md) — the JS using a new
#    plugin lives in the web build, not in the app.

# 2. Bump "buildNumber" in package.json (Play rejects a duplicate versionCode).
#    Bump "version" too if users should see a new version name.
git commit -am "chore: bump android build number to 5"

# 3. Build the AAB
vp run build
vp run android:sync                    # NO CAPACITOR_SERVER_URL — resets the app to production
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
Set-Location android
.\gradlew.bat bundleRelease
Set-Location ..

# 4. Verify it is release-signed (must NOT say CN=Android Debug)
& "$env:JAVA_HOME\bin\keytool.exe" -printcert -jarfile android\app\build\outputs\bundle\release\app-release.aab

# 5. Upload android\app\build\outputs\bundle\release\app-release.aab
#    Play Console → app → Testing → Internal testing (or Production) → Create new release
```

## Warnings

- **Skipping `vp run android:sync` in step 3 burns the version.** Tested against dev or a local
  Vite server? Then `android/app/src/main/assets/capacitor.config.json` still points there.
- **No `keystore.properties` = debug-signed build**, which Play rejects. Step 4 catches it.
- **Don't wipe `android/app/build/` between building and uploading.** R8 is on, and
  `app/build/outputs/mapping/release/mapping.txt` is the only key to readable crash stack traces
  for that version. It ships inside the AAB, so Play picks it up automatically — but only if it
  is still there when you upload.
- **A missing plugin class stops ALL plugins from registering at startup.** Worth checking every
  `classpath` in `android/app/src/main/assets/capacitor.plugins.json` exists in the build.

## Testing the build on a device

Install the release build directly instead of going through Play:

```powershell
.\gradlew.bat assembleRelease
adb install -r app\build\outputs\apk\release\app-release.apk
```

Do this at least once after any Gradle or plugin change — R8 strips unused code, and what it
strips too much of only fails at runtime, never at build time.
