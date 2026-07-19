# iOS push notifications — manual setup checklist

The repo-side changes (entitlements, Push Notifications capability, `UIBackgroundModes`) are done
on branch `ios-notifications`. Everything below happens outside this repo — Apple Developer portal,
OneSignal dashboard, and the GitHub Actions TestFlight workflow. Work top to bottom.

Background: push uses OneSignal on both platforms. The client code
(`src/services/pushNotificationService.ts`) is platform-neutral, and the server side
(`supabase/functions/send-push-notification`) targets users by OneSignal external_id
(= Supabase user id). No TypeScript or Supabase changes are needed for iOS — only the
APNs wiring below.

## 1. Apple Developer portal — APNs Auth Key

- [ ] Go to [Certificates, Identifiers & Profiles → Keys](https://developer.apple.com/account/resources/authkeys/list).
- [ ] If a key with **APNs** enabled already exists for the team, reuse it (one key covers every
      app in the team). Otherwise create one: **Keys → +**, name it e.g. `OneSignal APNs`,
      check **Apple Push Notifications service (APNs)**, register.
- [ ] Download the `.p8` file. **It can only be downloaded once** — store it somewhere safe
      (password manager), never in the repo.
- [ ] Note the **Key ID** (shown on the key page) and the **Team ID** (top right of the portal,
      or Membership page).
- [ ] Under **Identifiers**, open the App ID `no.hesteskokasting.app` and confirm
      **Push Notifications** is checked. (If it wasn't, existing provisioning profiles are
      invalidated — the CI build's `-allowProvisioningUpdates` regenerates them on next run.)

## 2. OneSignal dashboard — connect APNs

- [ ] Open the existing OneSignal app (the one whose id is `VITE_ONESIGNAL_APP_ID` — same app as
      Android, do **not** create a new one).
- [ ] **Settings → Push Platforms → Apple iOS (APNs)**.
- [ ] Choose **.p8 Auth Key**, upload the key, fill in **Key ID**, **Team ID**, and bundle ID
      `no.hesteskokasting.app`. Save.

## 3. Build environment (GitHub Actions)

iOS builds run via `.github/workflows/ios-testflight.yml` (macos runner → TestFlight),
not a local Mac. The workflow already injects `VITE_ONESIGNAL_APP_ID` at build time.

- [ ] Confirm the `testflight` environment secret `VITE_ONESIGNAL_APP_ID` is set in the
      GitHub repo (Settings → Environments → testflight) and matches the OneSignal app
      from step 2.

## 4. Build verification (CI)

The workflow signs with `-allowProvisioningUpdates` + an App Store Connect API key, so it
regenerates the provisioning profile to include the new `aps-environment` entitlement
automatically — provided step 1's App ID capability is enabled.

- [ ] Merge/push the `ios-notifications` changes and run the **iOS TestFlight** workflow
      (`workflow_dispatch`, empty `server_url` for production).
- [ ] If the Archive step fails with a provisioning/entitlements error mentioning
      `aps-environment`, the App ID capability from step 1 isn't enabled yet — fix in the
      portal and re-run.
- [ ] Note: the store-signed build gets `aps-environment: production` (the `development`
      value in `App.entitlements` is swapped during export signing). The .p8 key from
      step 1 covers both environments.

## 5. Optional: OneSignal Notification Service Extension

Recommended by OneSignal for confirmed-delivery analytics, badge counts, and rich media
(images) in notifications. Deliberately deferred: creating an extension target normally
requires Xcode, and this project builds via CI without a Mac. If it's ever wanted, either
borrow a Mac once to add the target (commit the resulting `ios/` changes), or hand-author
the extension target in `project.pbxproj` — riskier, but verifiable via the CI build.

- [ ] Target name `OneSignalNotificationServiceExtension`, bundle ID
      `no.hesteskokasting.app.OneSignalNotificationServiceExtension`, deployment target
      matching the app (iOS 15.0), linked against the `OneSignalExtension` SPM product,
      per https://documentation.onesignal.com/docs/ios-sdk-setup

## 6. End-to-end test (physical iPhone via TestFlight)

- [ ] Install the build from TestFlight on an iPhone, log in.
- [ ] Min side → innstillingar: enable a notification toggle → accept the iOS permission prompt.
- [ ] In OneSignal **Audience → Subscriptions**: verify the device appears as *Subscribed* with
      external id = the Supabase user id.
- [ ] Send a test push from the OneSignal dashboard (Messages → New Push → target that user)
      and confirm it arrives with the app in background/killed state.
- [ ] Trigger a real notification through the normal pipeline (e.g. start a stevne phase or
      create a kamp so the trigger enqueues into `notification_queue`) and confirm delivery.
- [ ] Tap the notification and verify the app opens the deep-linked route
      (`additionalData.route`, handled in `pushNotificationService.ts`).
