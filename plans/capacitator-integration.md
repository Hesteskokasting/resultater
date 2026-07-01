# Capacitor Integration Plan — hesteskokasting.no

## Goal
Wrap the existing Vite + vanilla TS app so it can run natively on Android and iOS, with native access to battery status for monitoring scoring devices. **Current priority: get it running on your own phone(s) before touching Google Play / App Store.**

---

## Phase 1: Basic setup

### 1.1 Install Capacitor in the existing project

```bash
npm install @capacitor/core @capacitor/cli
npx cap init
```

When prompted:
- App name: `Hesteskokasting`
- App ID (reverse domain): `no.hesteskokasting.app` (or `no.nhf.hesteskokasting`)
- Web dir: `dist` (Vite's default build output)

### 1.2 Add platforms

```bash
npm install @capacitor/ios @capacitor/android
npx cap add ios
npx cap add android
```

This generates `ios/` and `android/` folders with native projects. **Commit these to git** — they contain platform-specific config (icons, permissions, signing references).

### 1.3 Build-and-sync workflow

```bash
npm run build         # Vite builds to dist/
npx cap sync          # Copies dist/ into ios/ and android/, updates native deps
npx cap open ios      # Opens Xcode
npx cap open android  # Opens Android Studio
```

This becomes the standard workflow after any change you want to test natively.

### 1.4 CLAUDE.md addition

Add a section explaining:
- The web app builds normally with `npm run build`
- Native changes require `npx cap sync` afterward
- `ios/` and `android/` are generated but **committed** (not in `.gitignore`) because they contain manual config (plugins, signing references, icons)
- Never edit generated code in `ios/App/App/public/` or `android/app/src/main/assets/public/` directly — it gets overwritten on next sync

---

## Phase 2: Test on your own device (current focus)

### Android — easiest, no account needed

1. Build and sync as usual:
   ```bash
   npm run build
   npx cap sync android
   npx cap open android
   ```
2. On your phone: enable **Developer mode + USB debugging** (Settings → About phone → tap Build number 7 times), then connect via USB
3. In Android Studio, select your phone as the target device and hit Run (▶). The app installs directly — no Play Console account, no signing needed.

Alternative: build an APK (`Build → Build APK`), transfer it to the phone (email, Drive, USB), and install manually. Requires enabling "install from unknown sources" in phone settings.

### iOS — requires a Mac, but no paid account for this step

1. `npx cap open ios` opens Xcode
2. Connect your iPhone to the Mac via cable
3. In Xcode, select your iPhone as the target device, and under **Signing & Capabilities** choose "Personal Team" using your regular Apple ID (free)
4. Hit Run

Limitation: apps installed this way expire after 7 days and need reinstalling (free Apple ID restriction). You do **not** need the paid Developer membership (99 USD/year) for this step — only for App Store publishing or long-term TestFlight use.

### Testing checklist once installed

- [ ] App loads and connects to Supabase correctly (check for CORS/config issues specific to native webview)
- [ ] Realtime features (e.g. Scoreboard) work over the device's actual network
- [ ] Battery status plugin returns real values (see Phase 3 — test this on physical hardware, emulators often fake battery data)
- [ ] Basic navigation and core flows work as expected in the native wrapper

---

## Phase 3: Battery status plugin

### Option A: Community plugin (try first)

```bash
npm install @capacitor-community/battery-status
npx cap sync
```

```typescript
import { BatteryStatus } from '@capacitor-community/battery-status';

const info = await BatteryStatus.getInfo();
// { batteryLevel: number (0-1), isCharging: boolean }

BatteryStatus.addListener('batteryStatusChange', (info) => {
  console.log(`Battery: ${info.batteryLevel * 100}%, charging: ${info.isCharging}`);
});
```

Check the package's maintenance status before relying on it (last commit, open issues) — community plugins vary a lot in quality.

### Option B: Minimal custom plugin (fallback if A doesn't hold up)

If the plugin is outdated or unstable, a custom plugin is a day's work, not a project:

**iOS (Swift, ~15 lines):**
```swift
import Capacitor

@objc(BatteryPlugin)
public class BatteryPlugin: CAPPlugin {
    @objc func getLevel(_ call: CAPPluginCall) {
        UIDevice.current.isBatteryMonitoringEnabled = true
        call.resolve([
            "level": UIDevice.current.batteryLevel,
            "charging": UIDevice.current.batteryState == .charging
        ])
    }
}
```

**Android (Kotlin, ~20 lines):**
```kotlin
@CapacitorPlugin(name = "Battery")
class BatteryPlugin : Plugin() {
    @PluginMethod
    fun getLevel(call: PluginCall) {
        val bm = context.getSystemService(BATTERY_SERVICE) as BatteryManager
        val level = bm.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
        call.resolve(JSObject().put("level", level))
    }
}
```

### Use case

Alert admins/judges when a device used for scoring drops below a threshold (e.g. 20%) during an active tournament. This can hook into the existing realtime infrastructure (same pattern as `Scoreboard.ts`) — send an event to a `device_status` table or broadcast channel in Supabase when battery level crosses the threshold.

---

## Phase 4: App Store / Google Play preparation (later)

### Accounts (require board approval — budget item)
- **Apple Developer Program**: 99 USD/year
- **Google Play Console**: 25 USD one-time fee

### Signing
- **Android**: Generate a keystore (`keytool -genkey`), store it safely — a lost keystore means you can't update the app later
- **iOS**: Requires an Apple Developer membership, provisioning profiles, and certificates via Xcode or Fastlane

### App metadata to prepare regardless
- App icon (multiple sizes — `@capacitor/assets` can generate all sizes from one source image)
- Screenshots for both stores
- Privacy policy (required by both stores — relevant since you handle personal data about throwers)
- App description

### CI/CD extension (later, not critical for MVP)
Fastlane is the standard tool for automating builds and uploads to TestFlight/Play Console. Worth setting up *after* the first manual release, not before — don't try to solve signing automation while still learning the native build flow.

---

## Recommended order

1. **Now**: Phase 1 (basic setup) — verify the existing app runs fine in the Capacitor wrapper
2. **Now**: Test on your own Android phone via USB — fastest feedback loop
3. **Now**: Test on iPhone via Xcode + personal team, if you have Mac access
4. **Now**: Test the battery plugin specifically on physical hardware
5. **Later**: Fill out store metadata and submit for review, once local testing is solid
6. **Later**: Fastlane/CI automation, once you've done at least one manual release and understand the flow

---

## Risks to keep in mind

- **iOS review can reject apps that are effectively just a website wrapper** with no native added value. Battery monitoring + potential push notifications are good arguments for real native functionality — document this in the App Store description/review notes when you get there.
- **Free Supabase project pauses on inactivity** — relevant if the app is used rarely between tournaments, but this is already a known constraint.
- **Xcode requires macOS** — confirm you have access to a Mac (physical or cloud) for iOS builds and signing.