# Changesets

When you change code in `apps/` or `packages/`, add a changeset so the next release gets a proper version and changelog.

Run:

```bash
pnpm changeset
```

Then pick the packages to bump and write a short summary. A new file under `.changeset/` will be created. Commit it with your PR.
