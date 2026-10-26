---
name: Preserve Replit configuration during upstream merges
description: Guidance for reconciling this workspace with its GitHub source.
---

When merging this workspace with its GitHub upstream, preserve the active root Replit configuration. Review upstream or nested `.replit` files separately; do not import project-specific environment blocks blindly.

**Why:** The upstream configuration included environment settings, and conflict markers in the active `.replit` made it invalid for the Replit environment.

**How to apply:** Resolve source-code changes independently from Replit workflow settings. Keep the workspace's existing root configuration unless the user explicitly asks to replace it, and manage runtime values through Replit's environment settings.
