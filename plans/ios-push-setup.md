# iOS push notifications — manual setup checklist

The repo-side changes (entitlements, Push Notifications capability, `UIBackgroundModes`) are done
on branch `ios-notifications`. Everything below happens outside this repo — Apple Developer portal,
OneSignal dashboard, and Xcode on a Mac. Work top to bottom.

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
      invalidated — Xcode automatic signing regenerates them on next build.)

## 2. OneSignal dashboard — connect APNs

- [ ] Open the existing OneSignal app (the one whose id is `VITE_ONESIGNAL_APP_ID` — same app as
      Android, do **not** create a new one).
- [ ] **Settings → Push Platforms → Apple iOS (APNs)**.
- [ ] Choose **.p8 Auth Key**, upload the key, fill in **Key ID**, **Team ID**, and bundle ID
      `no.hesteskokasting.app`. Save.

## 3. Build environment on the Mac

- [ ] Ensure `.env.local` on the Mac contains a real `VITE_ONESIGNAL_APP_ID` (and the Supabase
      vars) before building — the value is baked into `dist/` at `npm run build` time.

## 4. Xcode verification

- [ ] `npm run build && npx cap sync ios && npx cap open ios`
- [ ] In Xcode: target **App → Signing & Capabilities** — confirm the **Push Notifications**
      capability is listed and `App/App.entitlements` is picked up
      (Build Settings → Code Signing Entitlements).
- [ ] Confirm **Background Modes → Remote notifications** is checked (comes from Info.plist).
- [ ] Select the team and let automatic signing create/refresh the provisioning profile.

## 5. Optional: OneSignal Notification Service Extension

Recommended by OneSignal for confirmed-delivery analytics, badge counts, and rich media
(images) in notifications. Deliberately not done in the repo — creating an extension target
is only practical from Xcode, and it needs its own bundle ID + provisioning profile.

- [ ] In Xcode: **File → New → Target → Notification Service Extension**, name it
      `OneSignalNotificationServiceExtension`, bundle ID
      `no.hesteskokasting.app.OneSignalNotificationServiceExtension`, deployment target
      matching the app (iOS 15.0).
- [ ] Add the `OneSignalExtension` SPM product to the new target and replace the generated
      `NotificationService` per OneSignal's guide:
      https://documentation.onesignal.com/docs/ios-sdk-setup
- [ ] Commit the resulting `ios/` changes from the Mac.

## 6. End-to-end test (physical iPhone — simulator push is unreliable with OneSignal)

- [ ] Run the app on a device from Xcode, log in.
- [ ] Min side → innstillingar: enable a notification toggle → accept the iOS permission prompt.
- [ ] In OneSignal **Audience → Subscriptions**: verify the device appears as *Subscribed* with
      external id = the Supabase user id.
- [ ] Send a test push from the OneSignal dashboard (Messages → New Push → target that user)
      and confirm it arrives with the app in background/killed state.
- [ ] Trigger a real notification through the normal pipeline (e.g. start a stevne phase or
      create a kamp so the trigger enqueues into `notification_queue`) and confirm delivery.
- [ ] Tap the notification and verify the app opens the deep-linked route
      (`additionalData.route`, handled in `pushNotificationService.ts`).
