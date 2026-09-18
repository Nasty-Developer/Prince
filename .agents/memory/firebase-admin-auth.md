---
name: Firebase admin authorization
description: The trust boundary and supported authorization mechanisms for SaveStreet Dogs Firebase authentication.
---

The API must cryptographically verify Firebase ID tokens before accepting authenticated or admin requests. Admin access is granted only by a verified `admin`/`role` custom claim or an explicit server-side UID allowlist; client-side claims are only a display hint.

**Why:** Decoding an unverified token or treating any signed-in Firebase user as an administrator would create fake authorization. The project can verify public Firebase ID tokens without a server credential, but setting custom claims requires a separate trusted administrative process.

**How to apply:** Keep public Firebase configuration in the web client, keep admin allowlists/custom-claim handling on the server, and return 401 for missing/invalid tokens or 403 for verified non-admin users.

Firebase account creation also requires the project’s Email/Password sign-in provider to be enabled in Firebase Authentication; the web API key alone cannot enable that project setting.

**Why:** A valid web configuration can reach Identity Toolkit while signup still returns `CONFIGURATION_NOT_FOUND` when Authentication has not been configured in the Firebase project.

**How to apply:** Treat `CONFIGURATION_NOT_FOUND` as a project-configuration blocker, show an actionable provider setup message, and do not add a second provider or invent local authentication.