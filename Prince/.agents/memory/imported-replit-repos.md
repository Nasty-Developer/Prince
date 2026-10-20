---
name: Imported Replit repositories
description: Durable setup steps for importing an existing Replit monorepo into a managed workspace.
---

When importing an existing Replit monorepo, preserve the workspace-managed artifact metadata, register any imported web artifact, and regenerate API clients after copying the repository so workspace package declarations match the imported OpenAPI contract.

**Why:** Existing generated client and schema declarations can lag behind the repository's API spec after an import, causing false compile failures even when the source contract and routes are present.

**How to apply:** After copying the repository, run the package install and the repository's API codegen command before typechecking leaf packages; then restart the managed app and API workflows.