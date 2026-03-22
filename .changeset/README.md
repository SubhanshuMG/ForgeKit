# Changesets

This directory is used by [changesets](https://github.com/changesets/changesets) to manage versioning and changelogs.

## How to add a changeset

When making a change that should be released, run:

```bash
npx changeset
```

This will prompt you to:
1. Select the packages that changed
2. Choose the bump type (patch / minor / major)
3. Write a summary of the change

A `.md` file will be created in this directory. Commit it with your PR.

## Release process

When changes are merged to `main`:
1. Bump the version in `packages/cli/package.json`
2. Update `CHANGELOG.md` with the changeset summaries
3. Create a GitHub Release with tag matching the new version
4. The `publish.yml` workflow will publish to npm automatically
