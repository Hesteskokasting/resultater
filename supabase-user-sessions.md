# User sessions

Supabase Auth provides fine-grained control over your user's sessions.

Some security sensitive applications, or those that need to be SOC 2, HIPAA, PCI-DSS or ISO27000 compliant will require some sort of additional session controls to enforce timeouts or provide additional security guarantees. Supabase Auth makes it easy to build compliant applications.

## What is a session?

A session is created when a user signs in. By default, it lasts indefinitely and a user can have an unlimited number of active sessions on as many devices.

A session is represented by the Supabase Auth access token in the form of a JWT, and a refresh token which is a unique string.

Access tokens are designed to be short lived, usually between 5 minutes and 1 hour while refresh tokens never expire but can only be used once. You can exchange a refresh token only once to get a new access and refresh token pair.

This process is called **refreshing the session.**

A session terminates, depending on configuration, when:

- The user clicks sign out.
- The user changes their password or performs a security sensitive action.
- It times out due to inactivity.
- It reaches its maximum lifetime.
- A user signs in on another device.

## Access token (JWT) claims

Every access token contains a `session_id` claim, a UUID, uniquely identifying the session of the user. You can correlate this ID with the primary key of the `auth.sessions` table.

## Initiating a session

A session is initiated when a user signs in. The session is stored in the `auth.sessions` table, and your app should receive the access and refresh tokens.

There are two flows for initiating a session and receiving the tokens:

- [Implicit flow](https://supabase.com/docs/guides/auth/sessions/implicit-flow)
- [PKCE flow](https://supabase.com/docs/guides/auth/sessions/pkce-flow)

## Limiting session lifetime and number of allowed sessions per user

Note: This feature is only available on Pro Plans and up.

Supabase Auth can be configured to limit the lifetime of a user's session. By default, all sessions are active until the user signs out or performs some other action that terminates a session.

In some applications, it's useful or required for security to ensure that users authenticate often, or that sessions are not left active on devices for too long.

There are three ways to limit the lifetime of a session:

- Time-boxed sessions, which terminate after a fixed amount of time.
- Set an inactivity timeout, which terminates sessions that haven't been refreshed within the timeout duration.
- Enforce a single-session per user, which only keeps the most recently active session.

To make sure that users are required to re-authenticate periodically, you can set a positive value for the **Time-box user sessions** option in the [Auth settings](https://supabase.com/dashboard/project/_/auth/sessions) for your project.

To make sure that sessions expire after a period of inactivity, you can set a positive duration for the **Inactivity timeout** option in the [Auth settings](https://supabase.com/dashboard/project/_/auth/sessions).

You can also enforce only one active session per user per device or browser. When this is enabled, the session from the most recent sign in will remain active, while the rest are terminated. Enable this via the *Single session per user* option in the [Auth settings](https://supabase.com/dashboard/project/_/auth/sessions).

Sessions are not proactively destroyed when you change these settings, but rather the check is enforced whenever a session is refreshed next. This can confuse developers because the actual duration of a session is the configured timeout plus the JWT expiration time. For single session per user, the effect will only be noticed at intervals of the JWT expiration time. Make sure you adjust this setting depending on your needs. We do not recommend going below 5 minutes for the JWT expiration time.

Otherwise sessions are progressively deleted from the database 24 hours after they expire, which prevents you from causing a high load on your project by accident and allows you some freedom to undo changes without adversely affecting all users.

## Frequently asked questions

### What are recommended values for access token (JWT) expiration?

Most applications should use the default expiration time of 1 hour. This can be customized in your [project's settings](https://supabase.com/dashboard/project/_/settings/jwt/legacy) in the JWT Keys > Legacy JWT Secret section.

Setting a value over 1 hour is generally discouraged for security reasons, but it may make sense in certain situations.

Values below 5 minutes, and especially below 2 minutes, should not be used in most situations because:

- The shorter the expiration time, the more frequently refresh tokens are used, which increases the load on the Auth server.
- Time is not absolute. Servers can often be off sync for tens of seconds, but user devices like laptops, desktops or mobile devices can sometimes be off by minutes or even hours. Having too short expiration time can cause difficult-to-debug errors due to clock skew.
- Supabase's client libraries always try to refresh the session ahead of time, which won't be possible if the expiration time is too short.
- Access tokens should generally be valid for at least as long as the longest running request in your application. This helps you avoid issues where the access token becomes invalid midway through processing.

### What is refresh token reuse detection and what does it protect from?

As your users continue using your app, refresh tokens are being constantly exchanged for new access tokens.

The general rule is that a refresh token can only be used once. However, strictly enforcing this can cause certain issues to arise. There are two exceptions to this design to prevent the early and unexpected termination of user's sessions:

- A refresh token can be used more than once within a defined reuse interval. By default this is 10 seconds and we do not recommend changing this value. This exception is granted for legitimate situations such as:
  - Using server-side rendering where the same refresh token needs to be reused on the server and soon after on the client
  - To allow some leeway for bugs or issues with serializing access to the refresh token request
- If the parent of the currently active refresh token for the user's session is being used, the active token will be returned. This exception solves an important and often common situation:
  - All clients such as browsers, mobile or desktop apps, and even some servers are inherently unreliable due to network issues. A request does not indicate that they received a response or even processed the response they received.
  - If a refresh token is revoked after being used only once, and the response wasn't received and processed by the client, when the client comes back online, it will attempt to use the refresh token that was already used. Since this might happen outside of the reuse interval, it can cause sudden and unexpected session termination.

Should the reuse attempt not fall under these two exceptions, the whole session is regarded as terminated and all refresh tokens belonging to it are marked as revoked. You can disable this behavior in the Advanced Settings of the [Auth settings](https://supabase.com/dashboard/project/_/auth/sessions) page, though it is generally not recommended.

The purpose of this mechanism is to guard against potential security issues where a refresh token could have been stolen from the user, for example by exposing it accidentally in logs that leak (like logging cookies, request bodies or URL params) or via vulnerable third-party servers. It does not guard against the case where a user's session is stolen from their device.

### What are the benefits of using access and refresh tokens instead of traditional sessions?

Traditionally user sessions were implemented by using a unique string stored in cookies that identified the authorization that the user had on a specific browser. Applications would use this unique string to constantly fetch the attached user information on every API call.

This approach has some tradeoffs compared to using a JWT-based approach:

- If the authentication server or its database crashes or is unavailable for even a few seconds, the whole application goes down. Scheduling maintenance or dealing with transient errors becomes very challenging.
- A failing authentication server can cause a chain of failures across other systems and APIs, paralyzing the whole application system.
- All requests that require authentication has to be routed through the authentication, which adds an additional latency overhead to all requests.

Supabase Auth prefers a JWT-based approach using access and refresh tokens because session information is encoded within the short-lived access token, enabling transfer across APIs and systems without dependence on a central server's availability or performance. This approach enhances an application's tolerance to transient failures or performance issues. Furthermore, proactively refreshing the access token allows the application to function reliably even during significant outages.

It's better for cost optimization and scaling as well, as the authentication system's servers and database only handle traffic for this use case.

### How to ensure an access token (JWT) cannot be used after a user signs out

Most applications rarely need such strong guarantees. Consider adjusting the JWT expiry time to an acceptable value. If this is still necessary, you should try to use this validation logic only for the most sensitive actions within your application.

When a user signs out, the sessions affected by the logout are removed from the database entirely. You can check that the `session_id` claim in the JWT corresponds to a row in the `auth.sessions` table. If such a row does not exist, it means that the user has logged out.

Note that sessions are not proactively terminated when their maximum lifetime (time-box) or inactivity timeout are reached. These sessions are cleaned up progressively 24 hours after reaching that status. This allows you to tweak the values or roll back changes without causing unintended user friction.

### Using HTTP-only cookies to store access and refresh tokens

This is possible, but only for apps that use the traditional server-only web app approach where all of the application logic is implemented on the server and it returns rendered HTML only.

If your app uses any client side JavaScript to build a rich user experience, using HTTP-Only cookies is not feasible since only your server will be able to read and refresh the session of the user. The browser will not have access to the access and refresh tokens.

Because of this, the Supabase JavaScript libraries provide only limited support. You can override the `storage` option when creating the Supabase client **on the server** to store the values in cookies or your preferred storage choice, for example:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient('SUPABASE_URL', 'SUPABASE_PUBLISHABLE_KEY', {
  auth: {
    storage: {
      getItem: () => {
        return Promise.resolve('FETCHED_COOKIE')
      },
      setItem: () => {},
      removeItem: () => {},
    },
  },
})
```

The `customStorageObject` should implement the `getItem`, `setItem`, and `removeItem` methods from the [`Storage` interface](https://developer.mozilla.org/en-US/docs/Web/API/Storage). Async versions of these methods are also supported.

When using cookies to store access and refresh tokens, make sure that the [`Expires` or `Max-Age` attributes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#attributes) of the cookies is set to a timestamp very far into the future. Browsers will clear the cookies, but the session will remain active in Supabase Auth. Therefore it's best to let Supabase Auth control the validity of these tokens and instruct the browser to always store the cookies indefinitely.

# Understanding API keys

First-layer protection for your project's data

Supabase gives you fine-grained control over which application components are allowed to access your project through API keys.

Tip: In most cases, you can get the correct key from [the Project's **Connect** dialog](https://supabase.com/dashboard/project/_?showConnect=true), but if you want a specific key, you can find all keys in the [**Settings > API Keys**](https://supabase.com/dashboard/project/_/settings/api-keys/) section of the Dashboard:

API keys provide the first layer of authentication for data access. Auth then builds upon that. This chart covers the differences:

| Responsibility                                         | Question                           | Answer                                             |
| ------------------------------------------------------ | ---------------------------------- | -------------------------------------------------- |
| API keys                                               | **What** is accessing the project? | Web page, mobile app, server, Edge Function...     |
| [Supabase Auth](https://supabase.com/docs/guides/auth) | **Who** is accessing the project?  | Monica, Jian Yang, Gavin, Dinesh, Laurie, Fiona... |

## Overview

An API key authenticates an application component to give it access to Supabase services. An application component might be a web page, a mobile app, or a server. The API key *does not* distinguish between users, only between applications.

There are 4 types of API keys that you can use with Supabase:

| Type            | Format               | Privileges | Availability  | Use                                                                                                                                                                                                                                                                                                                                       |
| --------------- | -------------------- | ---------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Publishable key | `sb_publishable_...` | Low        | Platform      | Safe to expose online: web page, mobile or desktop app, GitHub actions, CLIs, source code.                                                                                                                                                                                                                                                |
| Secret keys     | `sb_secret_...`      | Elevated   | Platform      | **Only use in backend components of your app:** servers, already secured APIs (admin panels), [Edge Functions](https://supabase.com/docs/guides/functions), microservices, etc. They provide *full access* to your project's data, bypassing [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security). |
| `anon`          | JWT (long lived)     | Low        | Platform, CLI | Legacy version of publishable keys.                                                                                                                                                                                                                                                                                                       |
| `service_role`  | JWT (long lived)     | Elevated   | Platform, CLI | Legacy version of secret keys.                                                                                                                                                                                                                                                                                                            |

## Publishable keys

Publishable keys identify the public components of your application. Public components run in environments where it is impossible to secure any secrets. These include:

- Web pages, where the key is bundled in source code.
- Mobile or desktop applications, where the key is bundled inside the compiled packages or executables.
- CLI, scripts, tools, or other pre-built executables.
- Other publicly available APIs that return the key without prior additional authorization.

These environments are always considered public because anyone can retrieve the key from the source code or build artifacts.

### Interaction with Supabase Auth

Using a publishable key does not mean that your user is anonymous. You can authenticate your application with the publishable key, while your user is authenticated (via Supabase Auth) with their personal JWT:

| Key             | User logged in via Supabase Auth | Postgres role used for RLS, etc. |
| --------------- | -------------------------------- | -------------------------------- |
| Publishable key | No                               | `anon`                           |
| Publishable key | Yes                              | `authenticated`                  |

### Security considerations

Publishable keys are not intended to protect from the following, since key retrieval is always possible from a public component:

- Static or dynamic code analysis and reverse engineering attempts.
- Use of the Network inspector in the browser.
- Cross-site request forgery, cross-site scripting, phishing attacks.
- Man-in-the-middle attacks.

When using a publishable key, access to your project's data is guarded by Postgres via the built-in `anon` and `authenticated` roles. For full protection make sure:

- You have enabled Row Level Security on all tables.
- You regularly review your Row Level Security policies for permissions granted to the `anon` and `authenticated` roles.
- You do not modify the role's attributes without understanding the changes you are making.

Your project's [Security Advisor](https://supabase.com/dashboard/project/_/advisors/security) constantly checks for common security problems with the built-in Postgres roles. Make sure you carefully review each finding before dismissing it.

## What secret keys allow access to

Unlike publishable keys, secret keys allow elevated access to your project's data. It is meant to be used only in secure, developer-controlled components of your application, such as:

- Servers that implement prior authorization themselves, such as Edge Functions, microservices, traditional or specialized web servers.
- Periodic jobs, queue processors, topic subscribers.
- Admin and back-office tools, with prior authorization checks only.
- Data processing pipelines, such as for analytics, reports, backups, or database synchronization.

Caution: Never expose your secret keys publicly. Your data is at risk. **Do not:**

- Add it to web pages, public documents, source code, bundle in executables or packages for mobile, desktop or CLI apps.
- Send over chat applications, email or SMS to your peers.
- Never use in a browser, even on `localhost`.
- Do not pass in URLs or query params, as these are often logged.
- Be careful passing them in request headers without prior log sanitization.
- Take extra care logging even potentially **invalid API keys**. Typos might reveal the real key in the future.
- Reveal, copy, use or manipulate on hardware devices without full disk encryption and which you do not directly own or control (such as public computers, friend's laptop, etc.)

Ensure you handle them with care and using [secure coding practices](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/stable-en/).

Secret keys authorize access to your project's data via the built-in `service_role` Postgres role. By design, this role has full access to your project's data. It also uses the [`BYPASSRLS` attribute](https://www.postgresql.org/docs/current/ddl-rowsecurity.html#:~:text=BYPASSRLS), skipping any and all Row Level Security policies you attach.

The secret key is an improvement over the old JWT-based `service_role` key, and we recommend using it where possible. It adds more checks to prevent misuse, specifically:

- You cannot use a secret key in the browser (matches on the `User-Agent` header) and it will always reply with HTTP 401 Unauthorized.
- You don't need to have any secret keys if you are not using them.

### Best practices for handling secret keys

Below are some starting guidelines on how to securely work with secret keys:

- Always work with secret keys on computers you fully own or control.
- Use secure & encrypted send tools to share API keys with others (often provided by good password managers), but prefer the [**Settings > API Keys**](https://supabase.com/dashboard/project/_/settings/api-keys/) section of the Dashboard instead.
- Prefer encrypting them when stored in files or environment variables.
- Do not add in source control, especially for CI scripts and tools. Prefer using the tool's native secrets capability instead.
- Prefer using a separate secret key for each separate backend component of your application, so that if one is found to be vulnerable or to have leaked the key you will only need to change it and not all.
- Even though a secret key will always return HTTP 401 Unauthorized error when used in a browser, it does not mean that attackers will not use it with other tools. Delete immediately!
- If you must include them in logs, log the first few random characters (but never more than 6).
- If you wish to log or store which valid API key was used, store it as a SHA256 hash.

### What to do if a secret key or `service_role` has been leaked or compromised?

Don't rush if this has happened, or you are suspecting it has. Make sure you have fully considered the situation and have remediated the root cause of the suspicion or vulnerability **first**. Consider using the [OWASP Risk Rating Methodology](https://owasp.org/www-community/OWASP_Risk_Rating_Methodology) as an easy way to identify the severity of the incident and to plan your next steps.

To rotate a secret key (`sb_secret_...`), use the [**Settings > API Keys**](https://supabase.com/dashboard/project/_/settings/api-keys/) section of the Dashboard to create a new secret API key, then replace it with the compromised key. Once all components are using the new key, delete the compromised one.

**Deleting a secret key is irreversible and once done it will be gone forever.**

If you are still using the JWT-based `service_role` key, replace the `service_role` key with a new secret key instead. Follow the guide from above as if you are rotating an existing secret key.

## Known limitations and compatibility differences

As the publishable and secret keys are no longer JWT-based, there are some known limitations and compatibility differences that you may need to plan for:

- You cannot send a publishable or secret key in the `Authorization: Bearer ...` header, except if the value exactly equals the `apikey` header. In this case, your request will be forwarded down to your project's database, but will be rejected as the value is not a JWT.
- Edge Functions **only support JWT verification** via the `anon` and `service_role` JWT-based API keys. You will need to use the `--no-verify-jwt` option when using publishable and secret keys. The Supabase platform does not verify the `apikey` header when using Edge Functions in this way. Implement your own `apikey`-header authorization logic inside the Edge Function code itself.
- Public Realtime connections are limited to 24 hours in duration, unless the connection is upgraded and further maintained with user-level authentication via Supabase Auth or a supported Third-Party Auth provider.

