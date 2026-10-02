---
name: Nested artifact preview routing
description: Replit proxy behavior when runnable artifacts live inside an imported repository subfolder.
---

When importing a monorepo under a subdirectory, its web artifact may register and run without becoming reachable through the workspace preview proxy. Keep the imported Git checkout intact and put the runnable app under the workspace-level `artifacts/` directory; sync the required frontend, API, and shared libraries into the root workspace.

**Why:** The imported app under `Prince/` returned a 404 at the shared preview root even though its workflow was healthy. A top-level artifact restored root preview routing.

**How to apply:** Verify the shared proxy URL after starting a nested artifact. If it is not routed, create or use a top-level artifact for the runnable app and preserve the source checkout separately.