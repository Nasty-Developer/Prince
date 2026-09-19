---
name: External media QA
description: Final verification guidance for externally hosted images used by the SaveStreet Dogs site.
---

Verify externally hosted media URLs as part of final preview QA, not only the application routes. A stale image URL can create a browser 404 and make an otherwise healthy page look broken.

**Why:** The final homepage check exposed one expired remote image URL that was not visible from typechecking or route checks.

**How to apply:** When a page uses remote images, probe each source URL during the final QA pass and replace unavailable sources before presenting the artifact.